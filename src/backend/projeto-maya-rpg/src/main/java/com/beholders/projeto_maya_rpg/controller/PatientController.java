package com.beholders.projeto_maya_rpg.controller;

import com.beholders.projeto_maya_rpg.model.Patient;
import com.beholders.projeto_maya_rpg.service.PatientService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping
    public ResponseEntity<Page<Patient>> getAll(Pageable pageable) {
        return ResponseEntity.ok(patientService.getAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Patient> getById(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.getById(id));
    }

    @PostMapping
    public ResponseEntity<Patient> create(@RequestBody Patient patient) {
        Patient saved = patientService.save(patient);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(saved.getId())
                .toUri();
        return ResponseEntity.created(location).body(saved);
    }

    @PostMapping("/login")
    public String login(@RequestBody String email, @RequestBody String password) {
        Patient patient = patientService.getByEmail(email);


    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        patientService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Patient> update(@PathVariable Long id, @RequestBody Patient patient) {
        return ResponseEntity.ok(patientService.update(id, patient));
    }

    @PatchMapping("/{id}/password")
    public ResponseEntity<Void> updatePassword(@PathVariable Long id, @RequestBody String newPasswordHash) {
        patientService.updatePassword(id, newPasswordHash);
        return ResponseEntity.noContent().build();
    }
}