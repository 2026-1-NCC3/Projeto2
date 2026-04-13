package com.beholders.projeto_maya_rpg.model;

import com.beholders.projeto_maya_rpg.model.enums.Status;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "plans")
public class Plan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Setter(lombok.AccessLevel.NONE)
    private Long id;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Status status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnoreProperties({"plans", "messages", "records", "hibernateLazyInitializer"})
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    @JsonIgnoreProperties({"plans", "messages", "records", "hibernateLazyInitializer"})
    private Admin admin;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"plan", "hibernateLazyInitializer"})
    private List<PlanExercises> planExercises;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}