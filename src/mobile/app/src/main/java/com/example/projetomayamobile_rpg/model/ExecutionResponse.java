package com.example.projetomayamobile_rpg.model;


public class ExecutionResponse {
    private Long id;
    private String executedAt;
    private boolean completed;
    private int painScale;

    public Long getId() { return id; }
    public String getExecutedAt() { return executedAt; }
    public boolean isCompleted() { return completed; }
    public int getPainScale() { return painScale; }
}