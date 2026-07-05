package com.learnheist.backend.controller;

import com.learnheist.backend.model.Puzzle;
import com.learnheist.backend.service.GeminiService;
import com.learnheist.backend.service.VaultService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/puzzles")
@RequiredArgsConstructor
public class PuzzleController {

    private final GeminiService geminiService;
    private final VaultService vaultService;

    // GET /api/puzzles/{vaultId} — get all puzzles for a vault
    @GetMapping("/{vaultId}")
    public ResponseEntity<List<Puzzle>> getPuzzlesForVault(
            @PathVariable String vaultId
    ) {
        return ResponseEntity.ok(vaultService.getPuzzlesForVault(vaultId));
    }

    // POST /api/puzzles/generate — generate puzzles using Gemini AI
    @PostMapping("/generate")
    public ResponseEntity<List<Puzzle>> generatePuzzles(
            @RequestBody Map<String, String> body
    ) {
        String vaultId = body.get("vaultId");
        String topic = body.get("topic");
        String difficulty = body.get("difficulty");

        // Generate one puzzle per role
        String[] roles = {"HACKER", "ANALYST", "PLANNER", "ENGINEER"};
        List<Puzzle> puzzles = new ArrayList<>();

        for (int i = 0; i < roles.length; i++) {
            Puzzle puzzle = geminiService.generatePuzzle(
                    vaultId,
                    roles[i],
                    topic,
                    difficulty
            );
            puzzle.setOrderIndex(i + 1);

            // Save to MongoDB
            vaultService.savePuzzle(puzzle);
            puzzles.add(puzzle);

            System.out.println("✅ Generated puzzle for role: " + roles[i]);
        }

        return ResponseEntity.ok(puzzles);
    }

    // POST /api/puzzles/{id}/submit — submit answer
    @PostMapping("/{id}/submit")
    public ResponseEntity<Map<String, Object>> submitAnswer(
            @PathVariable String id,
            @RequestBody Map<String, String> body
    ) {
        String answer = body.get("answer");
        boolean correct = vaultService.submitAnswer(id, answer);
        return ResponseEntity.ok(Map.of(
                "correct", correct,
                "message", correct ? "🔓 Correct! Puzzle solved!" : "❌ Wrong answer! Try again!"
        ));
    }
}