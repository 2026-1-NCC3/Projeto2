package com.beholders.projeto_maya_rpg.dto;

import com.beholders.projeto_maya_rpg.model.Admin;

public class AdminTokenDTO {
    private Admin adm;
    private String email;
    private String subject;

    public AdminTokenDTO(Admin adm, String email, String subject) {
        this.adm = adm;
        this.email = email;
        this.subject = subject;
    }

    public Admin getAdm() {
        return adm;
    }

    public String getEmail() {
        return email;
    }

    public String getSubject() {
        return subject;
    }
}
