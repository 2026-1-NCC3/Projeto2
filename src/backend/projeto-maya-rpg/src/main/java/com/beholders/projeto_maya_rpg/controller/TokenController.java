package com.beholders.projeto_maya_rpg.controller;

import com.beholders.projeto_maya_rpg.dto.AdminTokenDTO;
import com.beholders.projeto_maya_rpg.dto.VerifyCodeDTO;
import com.beholders.projeto_maya_rpg.exception.ResourceNotFoundException;
import com.beholders.projeto_maya_rpg.model.Admin;
import com.beholders.projeto_maya_rpg.model.Token;
import com.beholders.projeto_maya_rpg.repository.AdminRepository;
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
    private PasswordEncoder passwordEncoder;

    public TokenController(TokenService tokenService, EmailService emailService, AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.tokenService = tokenService;
        this.emailService = emailService;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/admin")
    public ResponseEntity<?> forgotPasswordAdmin(@RequestBody AdminTokenDTO dto) {

        Admin admin = adminRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("Admin não encontrado"));

        Token token = tokenService.forgetPasswordTokenAdmin(dto, admin);

        return ResponseEntity.ok("E-mail enviado com sucesso!");
    }

    @GetMapping("/verify")
    public ResponseEntity<Boolean> verifyCode(@RequestBody VerifyCodeDTO dto) {
        return ResponseEntity.ok(tokenService.verifyCode(dto.getCode(), dto.getEmail()));
    }

}
