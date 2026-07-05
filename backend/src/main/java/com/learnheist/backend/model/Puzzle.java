package com.learnheist.backend.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "puzzles")
public class Puzzle {

    @Id
    private String id;

    private String vaultId;

    // Which role this puzzle belongs to
    // HACKER, ANALYST, PLANNER, ENGINEER
    private String role;

    // Type of puzzle
    // MCQ, CODING, DEBUG, SYSTEM_DESIGN
    private String type;

    private String question;

    // Code snippet (optional - for coding/debug puzzles)
    private String codeSnippet;

    // For MCQ puzzles
    private List<Option> options;

    // Correct answer
    private String correctAnswer;

    // Hint
    private String hint;

    // XP penalty for using hint
    private int hintPenalty = 50;

    private int orderIndex;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Option {
        private String id;
        private String text;
    }
}