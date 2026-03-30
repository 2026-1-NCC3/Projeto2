package com.beholders.projeto_maya_rpg.controller;

import com.beholders.projeto_maya_rpg.model.Plan;
import com.beholders.projeto_maya_rpg.service.PlanService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/plan")
public class PlanController {
    private PlanService plansService;

    public PlanController(PlanService plansService) {
        this.plansService = plansService;
    }

    @PostMapping
    public ResponseEntity<Plan> create(@RequestBody Plan plan) {
        return ResponseEntity.ok(plansService.save(plan));
    }

    @GetMapping
    public ResponseEntity<Page<Plan>> getAll(Pageable pageable) {
        return ResponseEntity.ok(plansService.getAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Plan> getById(@PathVariable Long id) {
        return ResponseEntity.ok(plansService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Plan> update(@PathVariable Long id, @RequestBody Plan plan) {
        return ResponseEntity.ok(plansService.update(id, plan));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        plansService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
