package com.learnheist.backend.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String username;

    @Indexed(unique = true)
    private String email;

    private String password;

    private int xp = 0;

    private int level = 1;

    private int heistsPlayed = 0;

    private int heistsWon = 0;

    private int streak = 0;

    private List<String> badges = new ArrayList<>();

    // Skill DNA
    private int codingSkill = 0;
    private int theorySkill = 0;
    private int systemDesignSkill = 0;
    private int debuggingSkill = 0;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime lastPlayed;
}