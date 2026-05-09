package com.beholders.projeto_maya_rpg.dto;

public class PatientLoginResponseDTO {

    private String token;
    private Long id;

    public PatientLoginResponseDTO(String token, Long id) {
        this.token = token;
        this.id = id;
    }

    public String getToken() { return token; }
    public Long getId() { return id; }
}