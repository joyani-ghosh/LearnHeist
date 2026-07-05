package com.learnheist.backend.controller;

import com.learnheist.backend.model.Vault;
import com.learnheist.backend.model.Puzzle;
import com.learnheist.backend.service.VaultService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vaults")
@RequiredArgsConstructor
public class VaultController {

    private final VaultService vaultService;

    // GET /api/vaults
    @GetMapping
    public ResponseEntity<List<Vault>> getAllVaults() {
        return ResponseEntity.ok(vaultService.getAllVaults());
    }

    // GET /api/vaults/daily
    @GetMapping("/daily")
    public ResponseEntity<List<Vault>> getDailyVaults() {
        return ResponseEntity.ok(vaultService.getDailyVaults());
    }

    // GET /api/vaults/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Vault> getVaultById(@PathVariable String id) {
        return ResponseEntity.ok(vaultService.getVaultById(id));
    }

    // GET /api/vaults/{id}/puzzles
    @GetMapping("/{id}/puzzles")
    public ResponseEntity<List<Puzzle>> getPuzzles(@PathVariable String id) {
        return ResponseEntity.ok(vaultService.getPuzzlesForVault(id));
    }

    // POST /api/vaults/puzzles/{puzzleId}/submit
    @PostMapping("/puzzles/{puzzleId}/submit")
    public ResponseEntity<Map<String, Object>> submitAnswer(
            @PathVariable String puzzleId,
            @RequestBody Map<String, String> body
    ) {
        String answer = body.get("answer");
        boolean correct = vaultService.submitAnswer(puzzleId, answer);
        return ResponseEntity.ok(Map.of(
                "correct", correct,
                "message", correct ? "🔓 Correct! Puzzle solved!" : "❌ Wrong answer! Try again!"
        ));
    }

    // GET /api/vaults/seed (for testing - adds sample data)
    @GetMapping("/seed")
    public ResponseEntity<String> seedVaults() {
        vaultService.seedVaults();
        return ResponseEntity.ok("✅ Vaults seeded successfully!");
    }
}