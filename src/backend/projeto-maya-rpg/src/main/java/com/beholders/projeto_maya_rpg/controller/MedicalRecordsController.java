package com.beholders.projeto_maya_rpg.controller;

import com.beholders.projeto_maya_rpg.model.MedicalRecords;
import com.beholders.projeto_maya_rpg.service.MedicalRecordsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/medical-records")
public class MedicalRecordsController {

    private final MedicalRecordsService medicalRecordsService;

    public MedicalRecordsController(MedicalRecordsService medicalRecordsService) {
        this.medicalRecordsService = medicalRecordsService;
    }

    @GetMapping
    public ResponseEntity<List<MedicalRecords>> getAll() { //lista todos os registros medicos
        return ResponseEntity.ok(medicalRecordsService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicalRecords> getById(@PathVariable Long id) { //busca um registro medico pelo id
        return ResponseEntity.ok(medicalRecordsService.getById(id));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MedicalRecords>> getByPatientId(@PathVariable Long patientId) { //lista todos os registros medivos de um paciente
        return ResponseEntity.ok(medicalRecordsService.getByPatientId(patientId));
    }

    @GetMapping("/admin/{adminId}")
    public ResponseEntity<List<MedicalRecords>> getByAdminId(@PathVariable Long adminId) { //lista todos os registros medicos criados por um admin especifico
        return ResponseEntity.ok(medicalRecordsService.getByAdminId(adminId));
    }

    @PostMapping
    public ResponseEntity<MedicalRecords> create(@RequestBody MedicalRecords medicalRecord) { //cria um novo registro medico
        MedicalRecords saved = medicalRecordsService.save(medicalRecord);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(saved.getId())
                .toUri();
        return ResponseEntity.created(location).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicalRecords> update(@PathVariable Long id, @RequestBody MedicalRecords medicalRecord) { //atualiza um registro medico
        return ResponseEntity.ok(medicalRecordsService.update(id, medicalRecord));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) { //deleta um registro medico
        medicalRecordsService.delete(id);
        return ResponseEntity.noContent().build();
    }
}