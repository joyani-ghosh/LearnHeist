package com.learnheist.backend.repository;

import com.learnheist.backend.model.Vault;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VaultRepository extends MongoRepository<Vault, String> {

    // Get all vaults by difficulty
    List<Vault> findByDifficulty(String difficulty);

    // Get daily vault
    List<Vault> findByIsDailyVault(boolean isDailyVault);
}