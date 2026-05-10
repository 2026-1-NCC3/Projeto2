package com.beholders.projeto_maya_rpg.controller;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.beholders.projeto_maya_rpg.dto.LoginRequestDTO;
import com.beholders.projeto_maya_rpg.dto.PatientLoginResponseDTO;
import com.beholders.projeto_maya_rpg.model.Patient;
import com.beholders.projeto_maya_rpg.service.PatientService;
import com.beholders.projeto_maya_rpg.service.TokenService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import com.beholders.projeto_maya_rpg.dto.ResetPasswordDTO;

import java.net.URI;

@RestController
@RequestMapping("/patients")
public class PatientController {

    private final PatientService patientService;
    private final TokenService tokenService;

    public PatientController(PatientService patientService, TokenService tokenService) {
        this.patientService = patientService;
        this.tokenService = tokenService;
    }

    @GetMapping
    public ResponseEntity<Page<Patient>> getAll(Pageable pageable) {
        return ResponseEntity.ok(patientService.getAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Patient> getById(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.getById(id));
    }

    @GetMapping("/me")
    public ResponseEntity<DecodedJWT> getMe(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        DecodedJWT result = tokenService.decodeToken(token);
        return ResponseEntity.ok(result);
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

    /**
     * Login agora retorna { "token": "...", "id": 123 }
     * para que o Android possa armazenar o patientId no SharedPreferences.
     */
    @PostMapping("/login")
    public ResponseEntity<PatientLoginResponseDTO> login(@RequestBody LoginRequestDTO loginData) {
        Patient isAuth = patientService.verifyPatient(loginData.getEmail(), loginData.getPassword());
        String token = tokenService.generateToken(isAuth);
        return ResponseEntity.ok(new PatientLoginResponseDTO(token, isAuth.getId()));
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

    @PatchMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@RequestBody ResetPasswordDTO dto) {
        patientService.resetPassword(dto.getEmail(), dto.getNewPassword());
        return ResponseEntity.noContent().build();
    }
}