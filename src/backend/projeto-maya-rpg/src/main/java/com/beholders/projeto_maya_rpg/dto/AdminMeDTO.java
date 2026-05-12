package com.beholders.projeto_maya_rpg.dto;

public class AdminMeDTO {
    private String subject;
    private String issuer;
    private String expiresAt;

    public AdminMeDTO(String subject, String issuer, String expiresAt) {
        this.subject = subject;
        this.issuer = issuer;
        this.expiresAt = expiresAt;
    }

    public String getSubject() { return subject; }
    public String getIssuer() { return issuer; }
    public String getExpiresAt() { return expiresAt; }
}