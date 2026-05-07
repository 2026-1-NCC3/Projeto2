package com.beholders.projeto_maya_rpg.service;

import com.beholders.projeto_maya_rpg.exception.ResourceNotFoundException;
import com.beholders.projeto_maya_rpg.model.Plan;
import com.beholders.projeto_maya_rpg.model.PlanExercises;
import com.beholders.projeto_maya_rpg.repository.PlansRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PlanService {

    private PlansRepository plansRepository;

    public PlanService(PlansRepository plansRepository) {
        this.plansRepository = plansRepository;
    }


    @Transactional
    public Plan save(Plan plan) {
        if (plan.getPlanExercises() != null) {
            for (PlanExercises pe : plan.getPlanExercises()) {
                pe.setPlan(plan); // <-- essa linha resolve o erro!
            }
        }
        return plansRepository.save(plan);
    }


    public Page<Plan> getAll(Pageable pageable) {
        return plansRepository.findAll(pageable);
    }

    public Page<Plan> getByPatientId(Long patientId, Pageable pageable) {
        return plansRepository.findByPatientId(patientId, pageable);
    }

    public Plan getById(Long id) {
        return plansRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plano não encontrado"));
    }

    @Transactional
    public Plan update(Long id, Plan updatePlan) {
        Plan plan = plansRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(("Plano não encontrado!")));

        plan.setStatus(updatePlan.getStatus());

        return plan;
    }

    @Transactional
    public void delete(Long id) {
        Plan plan = plansRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(("Plano não encontrado!")));

        plansRepository.delete(plan);
    }
}
