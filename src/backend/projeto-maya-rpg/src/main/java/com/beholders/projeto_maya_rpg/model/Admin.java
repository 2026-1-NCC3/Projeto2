package com.beholders.projeto_maya_rpg.model;

import com.beholders.projeto_maya_rpg.model.enums.Status;
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
@Table(name = "admins")
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Setter(lombok.AccessLevel.NONE)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Status status;

    @OneToMany(mappedBy = "admin")
    @JsonIgnoreProperties({"admin", "hibernateLazyInitializer"})
    private List<Plan> plans;

    @OneToMany(mappedBy = "admin")
    @JsonIgnoreProperties({"admin", "hibernateLazyInitializer"})
    private List<Messages> messages;

    @OneToMany(mappedBy = "admin")
    @JsonIgnoreProperties({"admin", "hibernateLazyInitializer"})
    private List<MedicalRecords> records;
}