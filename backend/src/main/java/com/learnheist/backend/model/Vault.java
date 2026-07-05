package com.learnheist.backend.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "vaults")
public class Vault {

    @Id
    private String id;

    private String title;

    private String topic;

    private String description;

    private String difficulty; // ROOKIE, PRO, LEGEND

    private String emoji;

    private int xpReward;

    private boolean isDailyVault;

    private int timeLimitSeconds;

    private LocalDateTime createdAt = LocalDateTime.now();
}