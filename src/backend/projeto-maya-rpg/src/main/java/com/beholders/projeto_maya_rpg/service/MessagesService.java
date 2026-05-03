package com.beholders.projeto_maya_rpg.service;

import com.beholders.projeto_maya_rpg.exception.ResourceNotFoundException;
import com.beholders.projeto_maya_rpg.model.Messages;
import com.beholders.projeto_maya_rpg.repository.MessagesRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MessagesService {

    private MessagesRepository messagesRepository;

    public MessagesService(MessagesRepository messagesRepository) {
        this.messagesRepository = messagesRepository;
    }

    @Transactional
    public Messages create(Messages message) {
        return messagesRepository.save(message);
    }

    public Page<Messages> getAll(Pageable pageable) {
        return messagesRepository.findAll(pageable);
    }

    public Messages getById(Long id) {
        return messagesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mensagem não encontrada"));
    }

    @Transactional
    public Messages update(Long id, Messages message) {
        Messages existingMessage = messagesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mensagem não encontrada"));

        existingMessage.setSenderType(message.getSenderType());
        existingMessage.setMessage(message.getMessage());
        existingMessage.setPatient(message.getPatient());
        existingMessage.setAdmin(message.getAdmin());

        return messagesRepository.save(existingMessage);
    }

    @Transactional
    public void delete(Long id) {
        Messages message = messagesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mensagem não encontrada"));

        messagesRepository.delete(message);
    }
}