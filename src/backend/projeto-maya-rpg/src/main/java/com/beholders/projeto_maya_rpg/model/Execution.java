package com.beholders.projeto_maya_rpg.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name="executions")
public class Execution {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "executed_at", nullable = false)
    private LocalDateTime executedAt;

    @Column(nullable = false)
    private boolean completed;

    @Column(name = "pain_scale")
    private int painScale;

    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_exercise_id", nullable = false)
    private PlanExercises planExercise;

    public Execution() {

    }

    public Execution(Long id, LocalDateTime executedAt, boolean completed, int painScale, String notes) {
        this.id = id;
        this.executedAt = executedAt;
        this.completed = completed;
        this.painScale = painScale;
        this.notes = notes;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getExecutedAt() {
        return executedAt;
    }

    public void setExecutedAt(LocalDateTime executedAt) {
        this.executedAt = executedAt;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public int getPainScale() {
        return painScale;
    }

    public void setPainScale(int painScale) {
        this.painScale = painScale;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
