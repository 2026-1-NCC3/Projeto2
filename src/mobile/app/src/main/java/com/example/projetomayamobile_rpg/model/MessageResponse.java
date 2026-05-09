package com.example.projetomayamobile_rpg.model;

public class MessageResponse {
    private Long id;
    private String senderType;
    private String message;
    private String sentAt;
    private AdminRef admin;
    private PatientRef patient;

    public Long getId() { return id; }
    public String getSenderType() { return senderType; }
    public String getMessage() { return message; }
    public String getSentAt() { return sentAt; }
    public AdminRef getAdmin() { return admin; }
    public PatientRef getPatient() { return patient; }

    public static class AdminRef {
        private Long id;
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
    }

    public static class PatientRef {
        private Long id;
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
    }
}