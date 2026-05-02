package com.beholders.projeto_maya_rpg.controller;

import com.beholders.projeto_maya_rpg.model.Execution;
import com.beholders.projeto_maya_rpg.service.ExecutionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/executions")
public class ExecutionController {

    private final ExecutionService executionService;

    public ExecutionController(ExecutionService executionService) {
        this.executionService = executionService;
    }

    @GetMapping
    public ResponseEntity<List<Execution>> getAll() { // buscar todas as execuções
        return ResponseEntity.ok(executionService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Execution> getById(@PathVariable Long id) { // buscar uma execução pelo id
        return ResponseEntity.ok(executionService.getById(id));
    }

    @GetMapping("/plan-exercise/{planExerciseId}")
    public ResponseEntity<List<Execution>> getByPlanExerciseId(@PathVariable Long planExerciseId) { // buscar todas as execuções de um plano de exercicios
        return ResponseEntity.ok(executionService.getByPlanExerciseId(planExerciseId));
    }

    @PostMapping
    public ResponseEntity<Execution> create(@RequestBody Execution execution) { // adicionar nova execução
        Execution saved = executionService.save(execution);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(saved.getId())
                .toUri();
        return ResponseEntity.created(location).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Execution> update(@PathVariable Long id, @RequestBody Execution execution) { // atualizargit execução
        return ResponseEntity.ok(executionService.update(id, execution));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) { // deletar execução
        executionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}