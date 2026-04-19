package com.beholders.projeto_maya_rpg.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "executions")
public class Execution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Setter(lombok.AccessLevel.NONE)
    private Long id;

    @Column(name = "executed_at", nullable = false, updatable = false)
    private LocalDateTime executedAt;

    @Column(nullable = false)
    private boolean completed;

    @Column(name = "pain_scale")
    private int painScale;

    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_exercise_id", nullable = false)
    @JsonIgnoreProperties({"executions", "hibernateLazyInitializer"})
    private PlanExercises planExercise;

    @PrePersist
    public void prePersist() {
        this.executedAt = LocalDateTime.now();
    }
}