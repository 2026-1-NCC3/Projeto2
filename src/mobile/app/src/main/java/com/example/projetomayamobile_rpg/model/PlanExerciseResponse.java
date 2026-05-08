package com.example.projetomayamobile_rpg.model;

import java.util.List;

public class PlanExerciseResponse {

    private Long id;
    private String frequency;
    private String daysOfWeek;
    private String specificNotes;
    private ExerciseResponse exercise;
    private List<ExecutionResponse> executions;

    public Long getId() { return id; }
    public String getFrequency() { return frequency; }
    public String getDaysOfWeek() { return daysOfWeek; }
    public String getSpecificNotes() { return specificNotes; }
    public ExerciseResponse getExercise() { return exercise; }
    public List<ExecutionResponse> getExecutions() { return executions; }
}
