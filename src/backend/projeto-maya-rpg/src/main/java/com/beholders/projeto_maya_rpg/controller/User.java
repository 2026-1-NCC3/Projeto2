package com.beholders.projeto_maya_rpg.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/user")
public class User {

    @GetMapping
    public String allUsers() {
        return "Hello, world!";
    }
    
}
