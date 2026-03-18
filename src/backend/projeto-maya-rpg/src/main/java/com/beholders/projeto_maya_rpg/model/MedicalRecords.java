package com.beholders.projeto_maya_rpg.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "medical_records")
public class MedicalRecords {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_description")
    private String patientDescription;

    @Column(name = "recorded_at")
    private LocalDateTime recordedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private Admin admin;

    public MedicalRecords() {

    }

    public MedicalRecords(Long id, String patientDescription, LocalDateTime recordedAt) {
        this.id = id;
        this.patientDescription = patientDescription;
        this.recordedAt = recordedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPatientDescription() {
        return patientDescription;
    }

    public void setPatientDescription(String patientDescription) {
        this.patientDescription = patientDescription;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }
}
