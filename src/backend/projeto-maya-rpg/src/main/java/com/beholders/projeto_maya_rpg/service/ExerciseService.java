package com.beholders.projeto_maya_rpg.service;

import com.beholders.projeto_maya_rpg.exception.ResourceNotFoundException;
import com.beholders.projeto_maya_rpg.model.Exercise;
import com.beholders.projeto_maya_rpg.repository.ExerciseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ExerciseService {
    private ExerciseRepository exerciseRepository;

    public ExerciseService(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    @Transactional
    public Exercise save(Exercise exercise) {
        return exerciseRepository.save(exercise);
    }

    public Page<Exercise> getAll(Pageable pageable) {
        return exerciseRepository.findAll(pageable);
    }

    public Exercise getById(Long id) {
        return exerciseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found"));
    }

    @Transactional
    public Exercise update(Long id, Exercise updatedExercise) {
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found"));

        exercise.setName(updatedExercise.getName());
        exercise.setExerciseDescription(updatedExercise.getExerciseDescription());
        exercise.setInstructions(updatedExercise.getInstructions());
        exercise.setMediaList(updatedExercise.getMediaList());

        return exerciseRepository.save(exercise);
    }

    @Transactional
    public void delete(Long id) {
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found"));

        exerciseRepository.delete(exercise);
    }

}
