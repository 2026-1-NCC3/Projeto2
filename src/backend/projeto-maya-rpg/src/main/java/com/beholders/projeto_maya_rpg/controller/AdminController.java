package com.beholders.projeto_maya_rpg.controller;

import com.beholders.projeto_maya_rpg.model.Admin;
import com.beholders.projeto_maya_rpg.service.AdminService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
public class AdminController {
    private AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping
    public ResponseEntity<Admin> create(@RequestBody Admin adm) {
        return ResponseEntity.ok(adminService.create(adm));
    }

    @GetMapping
    public ResponseEntity<Page<Admin>> getAll(Pageable pageable) {
        return ResponseEntity.ok(adminService.getAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Admin> getById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Admin> update(@PathVariable Long id, @RequestBody Admin newAdm) {
        return ResponseEntity.ok(adminService.update(newAdm, id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        adminService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
