package com.example.projetomayamobile_rpg.model;

import java.util.List;

public class PlanResponse {
    private Long id;
    private String status;
    private String createdAt;
    private PatientResponse patient;
    private List<PlanExerciseResponse> planExercises;

    public Long getId() { return id; }
    public String getStatus() { return status; }
    public String getCreatedAt() { return createdAt; }
    public PatientResponse getPatient() { return patient; }
    public List<PlanExerciseResponse> getPlanExercises() { return planExercises; }
}