package com.learnheist.backend.repository;

import com.learnheist.backend.model.Puzzle;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PuzzleRepository extends MongoRepository<Puzzle, String> {

    // Get all puzzles for a vault
    List<Puzzle> findByVaultIdOrderByOrderIndexAsc(String vaultId);

    // Get puzzle by vault and role
    List<Puzzle> findByVaultIdAndRole(String vaultId, String role);
}