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

    // Dias da semana em que o exercício deve ser realizado.
    // Armazena valores de Calendar.DAY_OF_WEEK separados por vírgula.
    // Ex: "2,4,6" = Segunda, Quarta, Sexta
    // (1=Domingo, 2=Segunda, 3=Terça, 4=Quarta, 5=Quinta, 6=Sexta, 7=Sábado)
    @Column(name = "days_of_week")
    private String daysOfWeek;

    @Column(name = "specific_notes")
    private String specificNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    @JsonIgnoreProperties({"planExercises", "hibernateLazyInitializer"})
    private Plan plan;

    // Sem "mediaList" no ignore — serializa as URLs do YouTube no GET.
    // O Exercise.mediaList agora é @JsonProperty(READ_ONLY), então o
    // Jackson ignora mediaList na deserialização (POST/PUT) automaticamente.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer"})
    private Exercise exercise;

    @OneToMany(mappedBy = "planExercise", cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"planExercise", "hibernateLazyInitializer"})
    private List<Execution> executions;
}
