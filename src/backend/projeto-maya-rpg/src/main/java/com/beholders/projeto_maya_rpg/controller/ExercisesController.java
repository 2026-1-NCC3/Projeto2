package com.beholders.projeto_maya_rpg.controller;

import com.beholders.projeto_maya_rpg.model.Exercise;
import com.beholders.projeto_maya_rpg.service.ExerciseService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/exercise")
public class ExercisesController {

    private ExerciseService exerciseService;

    public ExercisesController(ExerciseService exerciseService) {
        this.exerciseService = exerciseService;
    }

    @GetMapping
    public ResponseEntity<Page<Exercise>> getAll(Pageable pageable) {
        return ResponseEntity.ok(exerciseService.getAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Exercise> getById(@PathVariable Long id) {
        return ResponseEntity.ok(exerciseService.getById(id));
    }

    @PostMapping
    public ResponseEntity<Exercise> create(@RequestBody Exercise exercise) {
        return ResponseEntity.ok(exerciseService.save(exercise));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Exercise> update(@PathVariable Long id, @RequestBody Exercise exercise) {
        return ResponseEntity.ok(exerciseService.update(id, exercise));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        exerciseService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
