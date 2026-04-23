package com.example.projetomayamobile_rpg.model;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class DashboardResponse {

    @SerializedName("patientName") //mudar para o nome que estiver no backend
    private String patientName;

    @SerializedName("totalExercises") //mudar para o nome que estiver no backend
    private int totalExercises;

    @SerializedName("completedExercises") //mudar para o nome que estiver no backend
    private int completedExercises;

    @SerializedName("pendingExercises") //mudar para o nome que estiver no backend
    private int pendingExercises;

    @SerializedName("exercises") //mudar para o nome que estiver no backend
    private List<ExerciseItem> exercises;

    public String getPatientName() { return patientName; }
    public int getTotalExercises() { return totalExercises; }
    public int getCompletedExercises() { return completedExercises; }
    public int getPendingExercises() { return pendingExercises; }
    public List<ExerciseItem> getExercises() { return exercises; }
}