package com.beholders.projeto_maya_rpg.model;


import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
public class Appointments {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "appointment_datetime", nullable = false)
    private LocalDateTime appointmentDatetime;

    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private Admin admin;

    public Appointments() {

    }

    public Appointments(Long id, LocalDateTime appointmentDatetime, String notes) {
        this.id = id;
        this.appointmentDatetime = appointmentDatetime;
        this.notes = notes;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getAppointmentDatetime() {
        return appointmentDatetime;
    }

    public void setAppointmentDatetime(LocalDateTime appointmentDatetime) {
        this.appointmentDatetime = appointmentDatetime;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
