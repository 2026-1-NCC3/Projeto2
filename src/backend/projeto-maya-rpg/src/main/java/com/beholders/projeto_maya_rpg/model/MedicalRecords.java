package com.beholders.projeto_maya_rpg.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "medical_records")
public class MedicalRecords {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Setter(lombok.AccessLevel.NONE)
    private Long id;

    @Column(name = "patient_description")
    private String patientDescription;

    @Column(name = "recorded_at", updatable = false)
    private LocalDateTime recordedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnoreProperties({"records", "plans", "messages", "hibernateLazyInitializer"})
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    @JsonIgnoreProperties({"records", "plans", "messages", "hibernateLazyInitializer"})
    private Admin admin;

    @PrePersist
    public void prePersist() {
        this.recordedAt = LocalDateTime.now();
    }
}