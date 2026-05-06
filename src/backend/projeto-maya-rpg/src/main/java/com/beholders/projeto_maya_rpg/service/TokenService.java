package com.beholders.projeto_maya_rpg.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.beholders.projeto_maya_rpg.dto.AdminTokenDTO;
import com.beholders.projeto_maya_rpg.exception.ResourceNotFoundException;
import com.beholders.projeto_maya_rpg.model.Admin;
import com.beholders.projeto_maya_rpg.model.Patient;
import com.beholders.projeto_maya_rpg.model.Token;
import com.beholders.projeto_maya_rpg.repository.TokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Random;

@Service
public class TokenService {

    @Value("${api.security.token.secret}")
    private String secret;

    private TokenRepository tokenRepository;

    private PasswordEncoder passwordEncoder;
    private EmailService emailService;

    public TokenService(TokenRepository tokenRepository, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public String generateToken(Patient patient) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);

            return JWT.create()
                    .withIssuer("maya-rpg-api")
                    .withSubject(patient.getEmail())
                    .withExpiresAt(LocalDateTime.now().plusDays(7).toInstant(ZoneOffset.of("-03:00")))
                    .sign(algorithm);

        } catch (JWTCreationException exception) {
            throw new RuntimeException("Erro ao gerar o token JWT", exception);
        }
    }

    public String generateTokenAdmin(Admin adm) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);

            return JWT.create()
                    .withIssuer("maya-rpg-api")
                    .withSubject(String.valueOf(adm.getId()))
                    .withExpiresAt(LocalDateTime.now().plusDays(7).toInstant(ZoneOffset.of("-03:00")))
                    .sign(algorithm);

        } catch (JWTCreationException exception) {
            throw new RuntimeException("Erro ao gerar o token JWT", exception);
        }
    }

    public String validateToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);

            return JWT.require(algorithm)
                    .withIssuer("maya-rpg-api")
                    .build()
                    .verify(token)
                    .getSubject();

        } catch (JWTVerificationException exception) {
            return "";
        }
    }

    public DecodedJWT decodeToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.require(algorithm)
                    .withIssuer("maya-rpg-api")
                    .build()
                    .verify(token);
        } catch (JWTVerificationException exception) {
            throw new RuntimeException("Token inválido ou expirado");
        }
    }

    @Transactional
    public Token forgetPasswordTokenAdmin(AdminTokenDTO dto, Admin adm) {
        Random generator = new Random();
        String resultToken = "";
        for (int i = 0; i < 6; i++) {
            int generatedNumber = generator.nextInt(10);
            resultToken += String.valueOf(generatedNumber);
        }

        String encodeToken = passwordEncoder.encode(resultToken);

        emailService.sendEmail(
                dto.getEmail(),
                dto.getSubject(),
                "Seu código de recuperação é: " + resultToken
        );

        Token token = new Token(encodeToken, adm, dto.getEmail());

        return tokenRepository.save(token);
    }

    public Boolean verifyCode(String code, String email) {
        Token token = tokenRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Token não encontrado!"));

        Boolean isMatch = passwordEncoder.matches(code, token.getToken());
        return isMatch;
    }

//    public Token forgetPasswordTokenPatient(Patient patient) {
//        Random generator = new Random();
//        String resultToken = "";
//        for (int i = 0; i < 6; i++) {
//            int generatedNumber = generator.nextInt(10);
//            resultToken += String.valueOf(generatedNumber);
//        }
//
//        String encodeToken = passwordEncoder.encode(resultToken);
//
//        Token token = new Token(encodeToken, patient);
//
//        return tokenRepository.save(token);
//    }
}
