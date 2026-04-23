package com.example.projetomayamobile_rpg.model;

import com.google.gson.annotations.SerializedName;

public class ExerciseItem {

    @SerializedName("name") //mudar para o nome que estiver no backend
    private String name;

    @SerializedName("frequency")  //mudar para o nome que estiver no backend
    private String frequency; // ex: "3x ao dia"

    @SerializedName("repetitions")  //mudar para o nome que estiver no backend
    private int repetitions;

    @SerializedName("completed")  //mudar para o nome que estiver no backend
    private boolean completed;

    public String getName() { return name; }
    public String getFrequency() { return frequency; }
    public int getRepetitions() { return repetitions; }
    public boolean isCompleted() { return completed; }
}