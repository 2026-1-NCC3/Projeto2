package com.beholders.projeto_maya_rpg.service;

import com.beholders.projeto_maya_rpg.exception.ResourceNotFoundException;
import com.beholders.projeto_maya_rpg.model.Execution;
import com.beholders.projeto_maya_rpg.repository.ExecutionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ExecutionService {

    private final ExecutionRepository executionRepository;

    public ExecutionService(ExecutionRepository executionRepository) {
        this.executionRepository = executionRepository;
    }

    public List<Execution> getAll() {
        return executionRepository.findAll();
    }

    public List<Execution> getByPlanExerciseId(Long planExerciseId) {
        return executionRepository.findByPlanExerciseId(planExerciseId);
    }

    public Execution getById(Long id) {
        return executionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Execution not found with id: " + id));
    }

    @Transactional
    public Execution save(Execution execution) {
        return executionRepository.save(execution);
    }

    @Transactional
    public void delete(Long id) {
        Execution execution = executionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Execution not found with id: " + id));
        executionRepository.delete(execution);
    }

    @Transactional
    public Execution update(Long id, Execution updatedExecution) {
        Execution execution = executionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Execution not found with id: " + id));

        execution.setCompleted(updatedExecution.isCompleted());
        execution.setPainScale(updatedExecution.getPainScale());
        execution.setNotes(updatedExecution.getNotes());
        execution.setPlanExercise(updatedExecution.getPlanExercise());

        return executionRepository.save(execution);
    }
}