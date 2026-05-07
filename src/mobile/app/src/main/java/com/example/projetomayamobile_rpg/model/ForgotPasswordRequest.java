package com.example.projetomayamobile_rpg.model;

public class ForgotPasswordRequest {
    private String email;
    private String subject;

    public ForgotPasswordRequest(String email, String subject) {
        this.email = email;
        this.subject = subject;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
}