package com.example.projetomayamobile_rpg.model;

import java.util.List;

public class ExerciseResponse {
    private Long id;
    private String name;
    private String exerciseDescription;
    private String instructions;
    private List<ExerciseMediaResponse> mediaList;

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getExerciseDescription() { return exerciseDescription; }
    public String getInstructions() { return instructions; }
    public List<ExerciseMediaResponse> getMediaList() { return mediaList; }
}