package com.beholders.projeto_maya_rpg.model;

import com.beholders.projeto_maya_rpg.model.enums.Status;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "patients")
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "password", nullable = false)
    private String passwordHash;

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Status status;

    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "patient")
    private List<Plan> plans;

    @OneToMany(mappedBy = "patient")
    private List<Messages> messages;

    @OneToMany(mappedBy = "patient")
    private List<MedicalRecords> records;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}