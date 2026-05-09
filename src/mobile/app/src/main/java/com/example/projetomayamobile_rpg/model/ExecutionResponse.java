package com.example.projetomayamobile_rpg.model;

import com.example.projetomayamobile_rpg.adapters.FlexibleDateAdapter;
import com.google.gson.annotations.JsonAdapter;

public class ExecutionResponse {
    private Long id;

    /** Aceita tanto "2024-05-08T10:30:00" quanto [2024,5,8,10,30,0] */
    @JsonAdapter(FlexibleDateAdapter.class)
    private String executedAt;

    private boolean completed;
    private int painScale;
    private String notes;

    public Long getId() { return id; }
    public String getExecutedAt() { return executedAt; }
    public boolean isCompleted() { return completed; }
    public int getPainScale() { return painScale; }
    public String getNotes() { return notes; }
}