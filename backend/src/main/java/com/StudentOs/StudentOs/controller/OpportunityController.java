package com.StudentOs.StudentOs.controller;

import com.StudentOs.StudentOs.entity.Opportunity;
import com.StudentOs.StudentOs.service.OpportunityService;

import jakarta.validation.constraints.NotBlank;

import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/opportunities")
@Validated
public class OpportunityController {

    private final OpportunityService opportunityService;

    public OpportunityController(
            OpportunityService opportunityService) {

        this.opportunityService = opportunityService;
    }


    // =========================================================
    // CREATE OPPORTUNITY
    // =========================================================

    @PostMapping
    public Opportunity createOpportunity(
            Authentication authentication,

            @RequestParam
            @NotBlank(message = "Opportunity title is required")
            String title,

            @RequestParam
            @NotBlank(message = "Opportunity type is required")
            String type,

            @RequestParam
            @NotBlank(message = "Opportunity description is required")
            String description,

            @RequestParam(required = false)
            String link) {

        String email = authentication.getName();

        return opportunityService.createOpportunity(
                email,
                title,
                type,
                description,
                link
        );
    }


    // =========================================================
    // GET ALL OPPORTUNITIES
    // =========================================================

    @GetMapping
    public List<Opportunity> getAllOpportunities() {

        return opportunityService.getAllOpportunities();
    }


    // =========================================================
    // GET MY OPPORTUNITIES
    // =========================================================

    @GetMapping("/my")
    public List<Opportunity> getMyOpportunities(
            Authentication authentication) {

        String email = authentication.getName();

        return opportunityService.getMyOpportunities(email);
    }


    // =========================================================
    // ADD REQUIRED SKILL
    // =========================================================

    @PostMapping("/{opportunityId}/skills")
    public Opportunity addRequiredSkill(
            @PathVariable Long opportunityId,

            @RequestParam
            @NotBlank(message = "Skill name is required")
            String skillName,

            Authentication authentication) {

        String email = authentication.getName();

        return opportunityService.addRequiredSkill(
                opportunityId,
                skillName,
                email
        );
    }


    // =========================================================
    // DELETE OPPORTUNITY
    // =========================================================

    @DeleteMapping("/{opportunityId}")
    public String deleteOpportunity(
            @PathVariable Long opportunityId,
            Authentication authentication) {

        String email = authentication.getName();

        return opportunityService.deleteOpportunity(
                opportunityId,
                email
        );
    }
}