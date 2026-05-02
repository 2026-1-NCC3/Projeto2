package com.beholders.projeto_maya_rpg.repository;

import com.beholders.projeto_maya_rpg.model.Execution;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExecutionRepository extends JpaRepository<Execution, Long> {

    List<Execution> findByPlanExerciseId(Long planExerciseId);
}