package com.beholders.projeto_maya_rpg.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/patient")
public class PatientController {

    @GetMapping
    public String allPatients() {
        return "Heelo, world!";
    }
    
}
