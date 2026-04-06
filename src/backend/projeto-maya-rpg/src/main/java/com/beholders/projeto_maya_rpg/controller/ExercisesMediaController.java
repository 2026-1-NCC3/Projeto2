package com.beholders.projeto_maya_rpg.controller;

import com.beholders.projeto_maya_rpg.model.ExerciseMedia;
import com.beholders.projeto_maya_rpg.service.ExerciseMediaService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/exercise/media")
public class ExercisesMediaController {
    private ExerciseMediaService exerciseMediaService;

    public ExercisesMediaController(ExerciseMediaService exerciseMediaService) {
        this.exerciseMediaService = exerciseMediaService;
    }

    @PostMapping
    public ResponseEntity<ExerciseMedia> create(@RequestBody ExerciseMedia exerciseMedia) {
        return ResponseEntity.ok(exerciseMediaService.save(exerciseMedia));
    }

    @GetMapping
    public ResponseEntity<Page<ExerciseMedia>> getAll(Pageable pageable) {
        return ResponseEntity.ok(exerciseMediaService.getAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExerciseMedia> getById(@PathVariable Long id) {
        return ResponseEntity.ok(exerciseMediaService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExerciseMedia> update(@PathVariable Long id, @RequestBody ExerciseMedia exerciseMedia) {
        return ResponseEntity.ok(exerciseMediaService.update(id, exerciseMedia));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        exerciseMediaService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
