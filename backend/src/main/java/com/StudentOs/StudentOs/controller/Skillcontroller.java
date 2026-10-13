package com.StudentOs.StudentOs.controller;

import com.StudentOs.StudentOs.service.SkillService;

import jakarta.validation.constraints.NotBlank;

import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/skills")
@Validated
public class Skillcontroller {

    private final SkillService skillService;

    public Skillcontroller(SkillService skillService) {
        this.skillService = skillService;
    }


    // =========================================================
    // ADD SKILL
    // =========================================================

    @PostMapping
    public String addSkill(
            Authentication authentication,

            @RequestParam
            @NotBlank(message = "Skill name is required")
            String name) {

        String email = authentication.getName();

        return skillService.addSkill(
                email,
                name
        );
    }


    // =========================================================
    // REMOVE SKILL
    // =========================================================

    @DeleteMapping
    public String removeSkill(
            Authentication authentication,

            @RequestParam
            @NotBlank(message = "Skill name is required")
            String name) {

        String email = authentication.getName();

        return skillService.removeSkill(
                email,
                name
        );
    }
}