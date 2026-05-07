package com.beholders.projeto_maya_rpg.repository;

import com.beholders.projeto_maya_rpg.model.Plan;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PlansRepository extends JpaRepository<Plan, Long> {
    @Query("SELECT p FROM Plan p WHERE p.patient.id = :patientId")
    Page<Plan> findByPatientId(@Param("patientId") Long patientId, Pageable pageable);
}
