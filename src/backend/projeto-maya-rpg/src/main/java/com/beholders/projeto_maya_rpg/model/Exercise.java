package com.beholders.projeto_maya_rpg.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table (name="exercises")
public class Exercise {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name="exercise_description", nullable = false)
    private String exerciseDescription;

    @Column(nullable = false)
    private String instructions;

    /* verificar colunas e chaves estrangeiras e relacionamentos */
    @OneToMany(mappedBy = "exercise")
    private List<ExerciseMedia> mediaList;

    public Exercise() {

    }

    public Exercise(Long id, String name, String exerciseDescription, String instructions) {
        this.id = id;
        this.name = name;
        this.exerciseDescription = exerciseDescription;
        this.instructions = instructions;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getExerciseDescription() {
        return exerciseDescription;
    }

    public void setExerciseDescription(String exerciseDescription) {
        this.exerciseDescription = exerciseDescription;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public List<ExerciseMedia> getMediaList() {
        return mediaList;
    }

    public void setMediaList(List<ExerciseMedia> mediaList) {
        this.mediaList = mediaList;
    }
}
