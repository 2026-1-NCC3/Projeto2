package com.beholders.projeto_maya_rpg.dto;

public class AdminTokenDTO {
    private String email;
    private String subject;

    public AdminTokenDTO() {}

    public AdminTokenDTO(String email, String subject) {
        this.email = email;
        this.subject = subject;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
}