package com.example.projetomayamobile_rpg.model;

import java.util.List;

/**
 * Versão atualizada de PlanResponse.
 * Adicionado campo `admin` para capturar o fisioterapeuta responsável pelo plano,
 * necessário para identificar o adminId ao enviar mensagens.
 */
public class PlanResponse {
    private Long id;
    private String status;
    private String createdAt;
    private PatientResponse patient;
    private AdminSimpleResponse admin;                // ← NOVO
    private List<PlanExerciseResponse> planExercises;

    public Long getId() { return id; }
    public String getStatus() { return status; }
    public String getCreatedAt() { return createdAt; }
    public PatientResponse getPatient() { return patient; }
    public AdminSimpleResponse getAdmin() { return admin; } // ← NOVO
    public List<PlanExerciseResponse> getPlanExercises() { return planExercises; }
}