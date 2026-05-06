package com.beholders.projeto_maya_rpg.model;

import jakarta.persistence.*;

@Entity
@Table(name = "token")
public class Token {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String token;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "admin_id")
    private Admin admin;

    @Column(name = "email")
    private String email;


    public Token() {
    }


    public Token(String token, Patient patient, String email) {
        this.token = token;
        this.patient = patient;
        this.email = email;
    }

    public Token(String token, Admin admin, String email) {
        this.token = token;
        this.admin = admin;
        this.email = email;
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient paciente) {
        this.patient = patient;
    }

    public Admin getAdmin() {
        return admin;
    }

    public void setAdmin(Admin admin) {
        this.admin = admin;
    }

    public String getEmail() {
        return email;
    }
}