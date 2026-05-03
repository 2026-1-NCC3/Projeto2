package com.beholders.projeto_maya_rpg.controller;

import com.beholders.projeto_maya_rpg.model.Messages;
import com.beholders.projeto_maya_rpg.service.MessagesService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/messages")
public class MessagesController {

    private MessagesService messagesService;

    public MessagesController(MessagesService messagesService) {
        this.messagesService = messagesService;
    }

    @PostMapping
    public ResponseEntity<Messages> create(@RequestBody Messages message) {
        return ResponseEntity.ok(messagesService.create(message));
    }

    @GetMapping
    public ResponseEntity<Page<Messages>> getAll(Pageable pageable) {
        return ResponseEntity.ok(messagesService.getAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Messages> getById(@PathVariable Long id) {
        return ResponseEntity.ok(messagesService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Messages> update(@PathVariable Long id, @RequestBody Messages message) {
        return ResponseEntity.ok(messagesService.update(id, message));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        messagesService.delete(id);
        return ResponseEntity.noContent().build();
    }
}