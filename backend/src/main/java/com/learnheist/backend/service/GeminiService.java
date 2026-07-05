package com.learnheist.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.learnheist.backend.model.Puzzle;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GeminiService {

    private static final long AI_COOLDOWN_MS = 60_000;

    @Value("${groq.api.key:}")
    private String apiKey;

    @Value("${groq.api.url}")
    private String apiUrl;

    @Value("${groq.model}")
    private String model;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private long aiRetryAfterMs = 0;

    // Generate a puzzle using Groq AI
    public Puzzle generatePuzzle(String vaultId, String role, String topic, String difficulty) {
        if (apiKey == null || apiKey.isBlank() || apiKey.contains("PASTE")) {
            System.out.println("Groq API key is missing. Using fallback puzzle.");
            return createFallbackPuzzle(vaultId, role, topic, difficulty);
        }

        if (System.currentTimeMillis() < aiRetryAfterMs) {
            return createFallbackPuzzle(vaultId, role, topic, difficulty);
        }

        try {
            String prompt = buildPrompt(role, topic, difficulty);
            String response = callGroqAPI(prompt);
            return parsePuzzleFromResponse(response, vaultId, role);
        } catch (WebClientResponseException.Forbidden e) {
            System.out.println("Groq API rejected the request. Check the API key.");
            return createFallbackPuzzle(vaultId, role, topic, difficulty);
        } catch (WebClientResponseException.Unauthorized e) {
            System.out.println("Groq API key is invalid or missing.");
            return createFallbackPuzzle(vaultId, role, topic, difficulty);
        } catch (WebClientResponseException.TooManyRequests e) {
            aiRetryAfterMs = System.currentTimeMillis() + AI_COOLDOWN_MS;
            System.out.println("Groq API rate limit reached. Using fallback puzzles for a short cooldown.");
            return createFallbackPuzzle(vaultId, role, topic, difficulty);
        } catch (Exception e) {
            System.out.println("AI puzzle generation failed: " + e.getMessage());
            return createFallbackPuzzle(vaultId, role, topic, difficulty);
        }
    }

    // Build prompt for Groq
    private String buildPrompt(String role, String topic, String difficulty) {
        String roleDescription = switch (role) {
            case "HACKER" -> "coding challenge or algorithm problem";
            case "ANALYST" -> "theory or concept MCQ question";
            case "PLANNER" -> "system design or architecture question";
            case "ENGINEER" -> "debugging or code fix challenge";
            default -> "general tech question";
        };

        return String.format("""
            Generate a %s %s about %s for a tech learning game.
            The question must have exactly one clearly correct answer.
            All three wrong options must be plausible but definitely incorrect.
            The correctAnswer field must match the correct option id exactly.
            Do not create trick questions or ambiguous questions.
            If the role is ENGINEER, include a short codeSnippet and ask about one concrete bug or fix.
            
            Return ONLY a valid JSON object in this exact format, no extra text:
            {
                "question": "the question text here",
                "codeSnippet": "code here or empty string if not needed",
                "options": [
                    {"id": "A", "text": "option A text"},
                    {"id": "B", "text": "option B text"},
                    {"id": "C", "text": "option C text"},
                    {"id": "D", "text": "option D text"}
                ],
                "correctAnswer": "A or B or C or D",
                "hint": "a helpful hint without giving away the answer"
            }
            
            Make it %s difficulty level.
            Before returning, verify the correctAnswer is factually correct.
            """,
                difficulty.toLowerCase(),
                roleDescription,
                topic,
                difficulty.toLowerCase()
        );
    }

    // Call Groq's OpenAI-compatible chat API
    private String callGroqAPI(String prompt) {
        WebClient client = WebClient.create();

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of(
                                "role", "system",
                                "content", "You generate educational puzzle JSON only. Never include markdown."
                        ),
                        Map.of(
                                "role", "user",
                                "content", prompt
                        )
                ),
                "temperature", 0.7
        );

        String response = client.post()
                .uri(apiUrl)
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        return response;
    }

    private Puzzle createFallbackPuzzle(String vaultId, String role, String topic, String difficulty) {
        Puzzle puzzle = new Puzzle();
        puzzle.setVaultId(vaultId);
        puzzle.setRole(role);
        puzzle.setType("MCQ");
        puzzle.setHintPenalty(50);

        if ("ENGINEER".equals(role)) {
            puzzle.setQuestion("What bug will this stack implementation hit when pop is called on an empty stack? (" + difficulty + ")");
            puzzle.setCodeSnippet("""
                    class Stack:
                        def __init__(self):
                            self.items = []

                        def pop(self):
                            return self.items.pop()
                    """);
            puzzle.setOptions(List.of(
                    new Puzzle.Option("A", "It returns the first item instead of the last item."),
                    new Puzzle.Option("B", "It raises an error because there is no item to remove."),
                    new Puzzle.Option("C", "It silently returns None for every call."),
                    new Puzzle.Option("D", "It sorts the stack before removing an item.")
            ));
            puzzle.setCorrectAnswer("B");
            puzzle.setHint("Check what list.pop() does when the list has no elements.");
            return puzzle;
        }

        puzzle.setCodeSnippet("");
        puzzle.setCorrectAnswer("B");
        puzzle.setHint("Think about the main job of this concept before choosing.");

        String question = switch (role) {
            case "HACKER" -> "Which choice best describes why " + topic + " matters when writing efficient code?";
            case "ANALYST" -> "Which statement is most accurate about " + topic + "?";
            case "PLANNER" -> "When planning a system, why would " + topic + " influence the architecture?";
            default -> "Which statement best matches " + topic + "?";
        };

        puzzle.setQuestion(question + " (" + difficulty + ")");
        puzzle.setOptions(List.of(
                new Puzzle.Option("A", "It only affects how the code looks."),
                new Puzzle.Option("B", "It affects correctness, performance, and maintainability."),
                new Puzzle.Option("C", "It is only useful after deployment."),
                new Puzzle.Option("D", "It replaces the need to test the program.")
        ));

        return puzzle;
    }

    // Parse Groq response into Puzzle object
    private Puzzle parsePuzzleFromResponse(String response, String vaultId, String role) {
        try {
            JsonNode root = objectMapper.readTree(response);

            // Extract generated text from Groq/OpenAI-compatible response
            String text = root
                    .path("choices")
                    .get(0)
                    .path("message")
                    .path("content")
                    .asText();

            // Clean the text — remove markdown code blocks if present
            text = text.replaceAll("```json", "").replaceAll("```", "").trim();

            // Parse puzzle JSON
            JsonNode puzzleJson = objectMapper.readTree(text);

            // Build puzzle object
            Puzzle puzzle = new Puzzle();
            puzzle.setVaultId(vaultId);
            puzzle.setRole(role);
            puzzle.setType("MCQ");
            puzzle.setQuestion(puzzleJson.path("question").asText());
            puzzle.setCodeSnippet(puzzleJson.path("codeSnippet").asText(""));
            puzzle.setCorrectAnswer(puzzleJson.path("correctAnswer").asText());
            puzzle.setHint(puzzleJson.path("hint").asText());
            puzzle.setHintPenalty(50);

            // Parse options
            List<Puzzle.Option> options = new ArrayList<>();
            JsonNode optionsNode = puzzleJson.path("options");
            for (JsonNode opt : optionsNode) {
                options.add(new Puzzle.Option(
                        opt.path("id").asText(),
                        opt.path("text").asText()
                ));
            }
            puzzle.setOptions(options);
            validatePuzzle(puzzle);

            return puzzle;

        } catch (Exception e) {
            throw new RuntimeException("Failed to parse AI response: " + e.getMessage());
        }
    }

    private void validatePuzzle(Puzzle puzzle) {
        if (isBlank(puzzle.getQuestion())) {
            throw new IllegalArgumentException("question is missing");
        }

        if (puzzle.getOptions() == null || puzzle.getOptions().size() != 4) {
            throw new IllegalArgumentException("expected exactly 4 options");
        }

        List<String> expectedIds = List.of("A", "B", "C", "D");
        List<String> actualIds = puzzle.getOptions().stream()
                .map(Puzzle.Option::getId)
                .toList();

        if (!actualIds.equals(expectedIds)) {
            throw new IllegalArgumentException("options must use ids A, B, C, D in order");
        }

        boolean hasBlankOption = puzzle.getOptions().stream()
                .anyMatch(option -> isBlank(option.getText()));
        if (hasBlankOption) {
            throw new IllegalArgumentException("option text is missing");
        }

        if (!expectedIds.contains(puzzle.getCorrectAnswer())) {
            throw new IllegalArgumentException("correctAnswer must be A, B, C, or D");
        }

        if (isBlank(puzzle.getHint())) {
            throw new IllegalArgumentException("hint is missing");
        }

        if ("ENGINEER".equals(puzzle.getRole()) && isBlank(puzzle.getCodeSnippet())) {
            throw new IllegalArgumentException("engineer puzzle needs a codeSnippet");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
