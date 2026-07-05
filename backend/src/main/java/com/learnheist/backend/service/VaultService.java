package com.learnheist.backend.service;

import com.learnheist.backend.model.Vault;
import com.learnheist.backend.model.Puzzle;
import com.learnheist.backend.repository.VaultRepository;
import com.learnheist.backend.repository.PuzzleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VaultService {

    private final VaultRepository vaultRepository;
    private final PuzzleRepository puzzleRepository;

    // Get all vaults
    public List<Vault> getAllVaults() {
        return vaultRepository.findAll();
    }

    // Get single vault by ID
    public Vault getVaultById(String id) {
        return vaultRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vault not found!"));
    }

    // Get daily vault
    public List<Vault> getDailyVaults() {
        return vaultRepository.findByIsDailyVault(true);
    }

    // Get vaults by difficulty
    public List<Vault> getVaultsByDifficulty(String difficulty) {
        return vaultRepository.findByDifficulty(difficulty);
    }

    // Get all puzzles for a vault
    public List<Puzzle> getPuzzlesForVault(String vaultId) {
        return puzzleRepository.findByVaultIdOrderByOrderIndexAsc(vaultId);
    }

    // Get puzzle by ID
    public Puzzle getPuzzleById(String id) {
        return puzzleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Puzzle not found!"));
    }

    // Submit puzzle answer
    public boolean submitAnswer(String puzzleId, String answer) {
        Puzzle puzzle = getPuzzleById(puzzleId);
        return puzzle.getCorrectAnswer().equals(answer);
    }

    // Seed initial vault data (for testing)
    public void seedVaults() {
        if (vaultRepository.count() == 0) {
            // Create DSA Vault
            Vault dsaVault = new Vault();
            dsaVault.setTitle("DSA Fundamentals");
            dsaVault.setTopic("Data Structures");
            dsaVault.setDescription("Master the basics of Data Structures and Algorithms");
            dsaVault.setDifficulty("ROOKIE");
            dsaVault.setEmoji("🌱");
            dsaVault.setXpReward(100);
            dsaVault.setDailyVault(true);
            dsaVault.setTimeLimitSeconds(600);
            vaultRepository.save(dsaVault);

            // Create System Design Vault
            Vault systemVault = new Vault();
            systemVault.setTitle("System Design Pro");
            systemVault.setTopic("Architecture");
            systemVault.setDescription("Learn how to design scalable systems");
            systemVault.setDifficulty("PRO");
            systemVault.setEmoji("⚙️");
            systemVault.setXpReward(250);
            systemVault.setDailyVault(false);
            systemVault.setTimeLimitSeconds(600);
            vaultRepository.save(systemVault);

            System.out.println("✅ Vaults seeded successfully!");
        }
    }

    public Puzzle savePuzzle(Puzzle puzzle) {
        return puzzleRepository.save(puzzle);
    }
}