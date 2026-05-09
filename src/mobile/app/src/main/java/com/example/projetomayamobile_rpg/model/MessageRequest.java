package com.example.projetomayamobile_rpg.model;

public class MessageRequest {
    private String senderType = "PATIENT";
    private String message;
    private MessageResponse.PatientRef patient;
    private MessageResponse.AdminRef admin;

    public MessageRequest(String message, Long patientId, Long adminId) {
        this.message = message;

        this.patient = new MessageResponse.PatientRef();
        this.patient.setId(patientId);

        this.admin = new MessageResponse.AdminRef();
        this.admin.setId(adminId);
    }

    public String getSenderType() { return senderType; }
    public String getMessage() { return message; }
    public MessageResponse.PatientRef getPatient() { return patient; }
    public MessageResponse.AdminRef getAdmin() { return admin; }
}