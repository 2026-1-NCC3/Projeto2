package com.beholders.projeto_maya_rpg.service;

import com.beholders.projeto_maya_rpg.exception.ResourceNotFoundException;
import com.beholders.projeto_maya_rpg.model.Patient;
import com.beholders.projeto_maya_rpg.repository.PatientRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private PasswordEncoder passwordEncoder;

    public PatientService(PatientRepository patientRepository, PasswordEncoder passwordEncoder) {
        this.patientRepository = patientRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Page<Patient> getAll(Pageable pageable) {
        return patientRepository.findAll(pageable);
    }

    public Patient getById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
    }

    public boolean verifyPatient(String email, String password) {
        Patient patient = patientRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid Credentials"));
        boolean isPasswordMatch = passwordEncoder.matches(password, patient.getPasswordHash());
        if (isPasswordMatch) {
            return true;
        }
        return false;
    }

    @Transactional
    public Patient save(Patient patient) {
        String passwordEncoded = passwordEncoder.encode(patient.getPasswordHash());

        patient.setPasswordHash(passwordEncoded);
        return patientRepository.save(patient);
    }

    @Transactional
    public void delete(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
        patientRepository.delete(patient);
    }

    @Transactional
    public Patient update(Long id, Patient updatedPatient) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));

        patient.setName(updatedPatient.getName());
        patient.setEmail(updatedPatient.getEmail());
        patient.setPhoneNumber(updatedPatient.getPhoneNumber());
        patient.setStatus(updatedPatient.getStatus());
        patient.setBirthDate(updatedPatient.getBirthDate());

        return patientRepository.save(patient);
    }

    @Transactional
    public void updatePassword(Long id, String newPasswordHash) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
        patient.setPasswordHash(newPasswordHash);
        patientRepository.save(patient);
    }
}