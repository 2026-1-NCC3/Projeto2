package com.example.projetomayamobile_rpg.model;

import com.example.projetomayamobile_rpg.adapters.FlexibleDateAdapter;
import com.google.gson.annotations.JsonAdapter;

public class AppointmentResponse {

    private Long id;

    @JsonAdapter(FlexibleDateAdapter.class)
    private String appointmentDatetime;

    private String notes;

    private AdminSimpleResponse admin;

    public Long getId() { return id; }
    public String getAppointmentDatetime() { return appointmentDatetime; }
    public String getNotes() { return notes; }
    public AdminSimpleResponse getAdmin() { return admin; }
}