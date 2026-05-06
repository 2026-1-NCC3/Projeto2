package com.beholders.projeto_maya_rpg.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendEmail(String email, String subject, String content) {
        SimpleMailMessage mensagem = new SimpleMailMessage();
        mensagem.setFrom("gabrielvmdiniz12@gmail.com");
        mensagem.setTo(email);
        mensagem.setSubject(subject);
        mensagem.setText(content);

        mailSender.send(mensagem);
        System.out.println("E-mail enviado com sucesso!");
    }
}