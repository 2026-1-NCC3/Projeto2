package com.beholders.projeto_maya_rpg.service;

import com.beholders.projeto_maya_rpg.exception.ResourceNotFoundException;
import com.beholders.projeto_maya_rpg.model.MedicalRecords;
import com.beholders.projeto_maya_rpg.repository.MedicalRecordsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MedicalRecordsService {

    private final MedicalRecordsRepository medicalRecordsRepository;

    public MedicalRecordsService(MedicalRecordsRepository medicalRecordsRepository) {
        this.medicalRecordsRepository = medicalRecordsRepository;
    }

    public List<MedicalRecords> getAll() {
        return medicalRecordsRepository.findAll();
    }

    public List<MedicalRecords> getByPatientId(Long patientId) {
        return medicalRecordsRepository.findByPatientId(patientId);
    }

    public List<MedicalRecords> getByAdminId(Long adminId) {
        return medicalRecordsRepository.findByAdminId(adminId);
    }

    public MedicalRecords getById(Long id) {
        return medicalRecordsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found with id: " + id));
    }

    @Transactional
    public MedicalRecords save(MedicalRecords medicalRecord) {
        return medicalRecordsRepository.save(medicalRecord);
    }

    @Transactional
    public void delete(Long id) {
        MedicalRecords medicalRecord = medicalRecordsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found with id: " + id));
        medicalRecordsRepository.delete(medicalRecord);
    }

    @Transactional
    public MedicalRecords update(Long id, MedicalRecords updatedRecord) {
        MedicalRecords medicalRecord = medicalRecordsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found with id: " + id));

        medicalRecord.setPatientDescription(updatedRecord.getPatientDescription());
        medicalRecord.setPatient(updatedRecord.getPatient());
        medicalRecord.setAdmin(updatedRecord.getAdmin());

        return medicalRecordsRepository.save(medicalRecord);
    }
}