package com.beholders.projeto_maya_rpg.service;

import com.beholders.projeto_maya_rpg.exception.ResourceNotFoundException;
import com.beholders.projeto_maya_rpg.model.Admin;
import com.beholders.projeto_maya_rpg.repository.AdminRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminService {
    private AdminRepository adminRepository;
    private PasswordEncoder passwordEncoder;

    public AdminService(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Admin create(Admin adm) {
        String newPassword = passwordEncoder.encode(adm.getPasswordHash());

        adm.setPasswordHash(newPassword);
        return adminRepository.save(adm);
    }

    public Admin getById(Long id) {
        return adminRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admin não encontrado"));
    }

    public Page<Admin> getAll(Pageable pageable) {
        return adminRepository.findAll(pageable);
    }

    @Transactional
    public Admin update(Admin admUpdate, Long id) {
        Admin adm = adminRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admin não encontrado"));

        adm.setName(admUpdate.getName());
        adm.setEmail(admUpdate.getEmail());

        String newPassword = passwordEncoder.encode(admUpdate.getPasswordHash());
        adm.setPasswordHash(newPassword);
        adm.setStatus(admUpdate.getStatus());
        return adm;
    }

    @Transactional
    public void delete(Long id) {
        Admin adm = adminRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admin não encontrado"));

        adminRepository.delete(adm);
    }
}
