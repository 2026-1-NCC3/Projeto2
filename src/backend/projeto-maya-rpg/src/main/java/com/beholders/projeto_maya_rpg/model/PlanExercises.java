package com.beholders.projeto_maya_rpg.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "plan_exercises")
public class PlanExercises {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Setter(lombok.AccessLevel.NONE)
    private Long id;

    @Column(nullable = false)
    private String frequency;

    @Column(name = "specific_notes")
    private String specificNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    @JsonIgnoreProperties({"planExercises", "hibernateLazyInitializer"})
    private Plan plan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = false)
    @JsonIgnoreProperties({"mediaList", "hibernateLazyInitializer"})
    private Exercise exercise;

    @OneToMany(mappedBy = "planExercise", cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"planExercise", "hibernateLazyInitializer"})
    private List<Execution> executions;
}