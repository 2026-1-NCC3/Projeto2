package com.beholders.projeto_maya_rpg.dto;

import com.beholders.projeto_maya_rpg.model.Admin;
import com.beholders.projeto_maya_rpg.model.enums.Status;

public class AdminDTO {
    private Long id;
    private String name;
    private Status status;

    public AdminDTO(Admin admin) {
        this.id = admin.getId();
        this.name = admin.getName();
        this.status = admin.getStatus();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Status getStatus() {
        return status;
    }
}
