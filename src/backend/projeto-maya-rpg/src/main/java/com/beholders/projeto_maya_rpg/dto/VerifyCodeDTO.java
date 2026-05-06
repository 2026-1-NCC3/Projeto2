package com.beholders.projeto_maya_rpg.dto;

public class VerifyCodeDTO {
    private String code;
    private String email;

    public VerifyCodeDTO(String code, String email) {
        this.code = code;
        this.email = email;
    }

    public String getCode() {
        return code;
    }

    public String getEmail() {
        return email;
    }
}
