package com.beholders.projeto_maya_rpg.repository;

import com.beholders.projeto_maya_rpg.model.Plan;
import org.hibernate.query.Page;
import org.springframework.data.jpa.repository.JpaRepository;

import java.awt.print.Pageable;

public interface PlansRepository extends JpaRepository<Plan, Long> {
    Page findAll(Pageable pageable);
}
