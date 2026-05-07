package com.example.projetomayamobile_rpg.model;

public class ExecutionRequest {
    private boolean completed;
    private int painScale;
    private String notes;
    private PlanExerciseRef planExercise;

    public ExecutionRequest(Long planExerciseId, int painScale) {
        this.completed = true;
        this.painScale = painScale;
        this.notes = "";
        this.planExercise = new PlanExerciseRef(planExerciseId);
    }

    public static class PlanExerciseRef {
        private Long id;
        public PlanExerciseRef(Long id) { this.id = id; }
        public Long getId() { return id; }
    }

    public boolean isCompleted() { return completed; }
    public int getPainScale() { return painScale; }
    public String getNotes() { return notes; }
    public PlanExerciseRef getPlanExercise() { return planExercise; }
}