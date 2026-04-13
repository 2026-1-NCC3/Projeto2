package com.beholders.projeto_maya_rpg.model;

import com.beholders.projeto_maya_rpg.model.enums.SenderType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "messages")
public class Messages {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Setter(lombok.AccessLevel.NONE)
    private Long id;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private SenderType senderType;

    @Column(nullable = false)
    private String message;

    @Column(name = "sent_at", updatable = false)
    private LocalDateTime sentAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnoreProperties({"messages", "plans", "records", "hibernateLazyInitializer"})
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    @JsonIgnoreProperties({"messages", "plans", "records", "hibernateLazyInitializer"})
    private Admin admin;

    @PrePersist
    public void prePersist() {
        this.sentAt = LocalDateTime.now();
    }
}