package com.beholders.projeto_maya_rpg.model;

import jakarta.persistence.*;

@Entity
@Table (name = "plan_exercises")
public class PlanExercises {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String frequency;

    @Column(name = "specific_notes")
    private String specificNotes;

    /* verificar colunas e chaves estrangeiras e relacionamentos */

    public PlanExercises() {

    }

    public PlanExercises(Long id, String frequency, String specificNotes) {
        this.id = id;
        this.frequency = frequency;
        this.specificNotes = specificNotes;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    public String getSpecificNotes() {
        return specificNotes;
    }

    public void setSpecificNotes(String specificNotes) {
        this.specificNotes = specificNotes;
    }
}
