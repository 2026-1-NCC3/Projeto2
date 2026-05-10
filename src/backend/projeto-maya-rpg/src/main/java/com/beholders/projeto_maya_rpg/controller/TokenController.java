package com.beholders.projeto_maya_rpg.controller;

import com.beholders.projeto_maya_rpg.dto.AdminTokenDTO;
import com.beholders.projeto_maya_rpg.dto.VerifyCodeDTO;
import com.beholders.projeto_maya_rpg.exception.ResourceNotFoundException;
import com.beholders.projeto_maya_rpg.model.Admin;
import com.beholders.projeto_maya_rpg.model.Patient;
import com.beholders.projeto_maya_rpg.model.Token;
import com.beholders.projeto_maya_rpg.repository.AdminRepository;
import com.beholders.projeto_maya_rpg.repository.PatientRepository;
import com.beholders.projeto_maya_rpg.service.EmailService;
import com.beholders.projeto_maya_rpg.service.TokenService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/token")
public class TokenController {
    private TokenService tokenService;
    private EmailService emailService;
    private AdminRepository adminRepository;
    private PatientRepository patientRepository;
    private PasswordEncoder passwordEncoder;

    public TokenController(TokenService tokenService, EmailService emailService, AdminRepository adminRepository, PasswordEncoder passwordEncoder, PatientRepository patientRepository) {
        this.tokenService = tokenService;
        this.emailService = emailService;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.patientRepository = patientRepository;
    }

    @PostMapping("/admin")
    public ResponseEntity<?> forgotPasswordAdmin(@RequestBody AdminTokenDTO dto) {

        Admin admin = adminRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("Admin não encontrado"));

        Token token = tokenService.forgetPasswordTokenAdmin(dto, admin);

        return ResponseEntity.ok("E-mail enviado com sucesso!");
    }

    @PostMapping("/patient")
    public ResponseEntity<?> forgotPasswordPatient(@RequestBody AdminTokenDTO dto) {

        Patient patient = patientRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado"));

        Token token = tokenService.forgetPasswordTokenPatient(dto, patient);

        return ResponseEntity.ok("E-mail enviado com sucesso!");
    }

    @PostMapping("/verify")
    public ResponseEntity<Boolean> verifyCode(@RequestBody VerifyCodeDTO dto) {
        return ResponseEntity.ok(tokenService.verifyCode(dto.getCode(), dto.getEmail()));
    }

}
