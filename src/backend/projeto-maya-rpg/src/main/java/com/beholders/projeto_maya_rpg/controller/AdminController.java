package com.beholders.projeto_maya_rpg.controller;

import com.beholders.projeto_maya_rpg.dto.LoginRequestDTO;
import com.beholders.projeto_maya_rpg.model.Admin;
import com.beholders.projeto_maya_rpg.model.Patient;
import com.beholders.projeto_maya_rpg.service.AdminService;
import com.beholders.projeto_maya_rpg.service.TokenService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
public class AdminController {
    private AdminService adminService;
    private TokenService tokenService;

    public AdminController(AdminService adminService, TokenService tokenService) {
        this.adminService = adminService;
        this.tokenService = tokenService;
    }

    @PostMapping
    public ResponseEntity<Admin> create(@RequestBody Admin adm) {
        return ResponseEntity.ok(adminService.create(adm));
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequestDTO loginData) {
        Admin isAuth = adminService.verifyAdmin(loginData.email, loginData.password);

        String token = tokenService.generateTokenAdmin(isAuth);

        return ResponseEntity.ok(token);
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
