package com.beholders.projeto_maya_rpg.controller;

import com.beholders.projeto_maya_rpg.model.Appointments;
import com.beholders.projeto_maya_rpg.service.AppointmentsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/appointments")
public class AppointmentsController {

    private final AppointmentsService appointmentsService;

    public AppointmentsController(AppointmentsService appointmentsService) {
        this.appointmentsService = appointmentsService;
    }

    @GetMapping // lista todas as consultas
    public ResponseEntity<List<Appointments>> getAll() {
        return ResponseEntity.ok(appointmentsService.getAll());
    }

    @GetMapping("/{id}") // busca uma consulta pelo id
    public ResponseEntity<Appointments> getById(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentsService.getById(id));
    }

    @GetMapping("/patient/{patientId}") // lista todas as consultas de um paciente específico
    public ResponseEntity<List<Appointments>> getByPatientId(@PathVariable Long patientId) {
        return ResponseEntity.ok(appointmentsService.getByPatientId(patientId));
    }

    @GetMapping("/admin/{adminId}") // lista todas as consultas de um admin específico
    public ResponseEntity<List<Appointments>> getByAdminId(@PathVariable Long adminId) {
        return ResponseEntity.ok(appointmentsService.getByAdminId(adminId));
    }

    @PostMapping // cria uma nova consulta
    public ResponseEntity<Appointments> create(@RequestBody Appointments appointment) {
        Appointments saved = appointmentsService.save(appointment);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(saved.getId())
                .toUri();
        return ResponseEntity.created(location).body(saved);
    }

    @PutMapping("/{id}") // atualiza uma consulta existente
    public ResponseEntity<Appointments> update(@PathVariable Long id, @RequestBody Appointments appointment) {
        return ResponseEntity.ok(appointmentsService.update(id, appointment));
    }

    @DeleteMapping("/{id}") // deleta uma consulta
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        appointmentsService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
