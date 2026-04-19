package com.beholders.projeto_maya_rpg.repository;

import com.beholders.projeto_maya_rpg.model.MedicalRecords;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicalRecordsRepository extends JpaRepository<MedicalRecords, Long> {

    List<MedicalRecords> findByPatientId(Long patientId);
    List<MedicalRecords> findByAdminId(Long adminId);
}