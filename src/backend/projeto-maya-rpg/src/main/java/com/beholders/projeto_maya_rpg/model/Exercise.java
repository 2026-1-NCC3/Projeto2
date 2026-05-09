package com.beholders.projeto_maya_rpg.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "exercises")
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Setter(lombok.AccessLevel.NONE)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "exercise_description", nullable = false)
    private String exerciseDescription;

    @Column(nullable = false)
    private String instructions;

    // READ_ONLY = inclui mediaList no JSON de resposta (GET),
    // mas ignora no JSON de entrada (POST/PUT), evitando
    // referência circular do Jackson ao deserializar.
    @OneToMany(mappedBy = "exercise")
    @JsonIgnoreProperties({"exercise", "hibernateLazyInitializer"})
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private List<ExerciseMedia> mediaList;
}
