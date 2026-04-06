package com.beholders.projeto_maya_rpg.service;

import com.beholders.projeto_maya_rpg.exception.ResourceNotFoundException;
import com.beholders.projeto_maya_rpg.model.ExerciseMedia;
import com.beholders.projeto_maya_rpg.repository.ExerciseMediaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ExerciseMediaService {
    private ExerciseMediaRepository exerciseMediaRepository;

    public ExerciseMediaService(ExerciseMediaRepository exerciseMediaRepository) {
        this.exerciseMediaRepository = exerciseMediaRepository;
    }

    @Transactional
    public ExerciseMedia save(ExerciseMedia exerciseMedia) {
        return exerciseMediaRepository.save(exerciseMedia);
    }

    public ExerciseMedia getById(Long id) {
        return exerciseMediaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Media não encontrada"));
    }

    public Page<ExerciseMedia> getAll(Pageable pageable) {
        return exerciseMediaRepository.findAll(pageable);
    }

    @Transactional
    public ExerciseMedia update(Long id, ExerciseMedia exerciseMediaUpdate) {
        ExerciseMedia exerciseMedia = exerciseMediaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Media não encontrada"));

        exerciseMedia.setImageUrl(exerciseMediaUpdate.getImageUrl());
        exerciseMedia.setExercise(exerciseMediaUpdate.getExercise());

        return exerciseMediaRepository.save(exerciseMedia);
    }

    @Transactional
    public void delete(Long id) {
        ExerciseMedia exerciseMedia = exerciseMediaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Media não encontrada"));

        exerciseMediaRepository.delete(exerciseMedia);
    }
}
