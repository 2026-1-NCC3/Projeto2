package com.beholders.projeto_maya_rpg.model;

import com.beholders.projeto_maya_rpg.model.enums.SenderType;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name="messages")
public class Messages {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private SenderType senderType;

    private String message;

    @Column(name = "sent_at")
    private LocalTime sentAt;

    /* verificar colunas e chaves estrangeiras e relacionamentos */

    public Messages() {

    }

    public Messages(Long id, SenderType senderType, String message, LocalTime sentAt) {
        this.id = id;
        this.senderType = senderType;
        this.message = message;
        this.sentAt = sentAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public SenderType getSenderType() {
        return senderType;
    }

    public void setSenderType(SenderType senderType) {
        this.senderType = senderType;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalTime getSentAt() {
        return sentAt;
    }

    public void setSentAt(LocalTime sentAt) {
        this.sentAt = sentAt;
    }
}
