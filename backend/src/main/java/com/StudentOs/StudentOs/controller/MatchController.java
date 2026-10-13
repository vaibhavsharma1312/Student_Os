package com.StudentOs.StudentOs.controller;

import com.StudentOs.StudentOs.dto.OpportunityMatchResponse;
import com.StudentOs.StudentOs.dto.ProjectMatchResponse;
import com.StudentOs.StudentOs.dto.SkillGapResponse;
import com.StudentOs.StudentOs.dto.TeamGapResponse;

import com.StudentOs.StudentOs.service.MatchService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/match")
public class MatchController {

    private final MatchService matchService;

    public MatchController(MatchService matchService) {
        this.matchService = matchService;
    }


    // =========================================================
    // MATCH WITH ONE PROJECT
    // =========================================================

    @GetMapping("/project/{projectId}")
    public double calculateProjectMatch(
            @PathVariable Long projectId,
            Authentication authentication) {

        String email = authentication.getName();

        return matchService.calculateMatch(
                projectId,
                email
        );
    }


    // =========================================================
    // MATCH WITH ALL PROJECTS
    // =========================================================

    @GetMapping("/projects")
    public List<ProjectMatchResponse> getProjectMatches(
            Authentication authentication) {

        String email = authentication.getName();

        return matchService.getProjectMatches(email);
    }


    // =========================================================
    // MATCH WITH ALL OPPORTUNITIES
    // =========================================================

    @GetMapping("/opportunities")
    public List<OpportunityMatchResponse> getOpportunityMatches(
            Authentication authentication) {

        String email = authentication.getName();

        return matchService.getOpportunityMatches(email);
    }


    // =========================================================
    // INDIVIDUAL SKILL GAP
    // =========================================================

    @GetMapping("/skill-gap/{projectId}")
    public SkillGapResponse getSkillGap(
            @PathVariable Long projectId,
            Authentication authentication) {

        String email = authentication.getName();

        return matchService.getSkillGap(
                projectId,
                email
        );
    }


    // =========================================================
    // TEAM GAP ANALYSIS
    // =========================================================

    @GetMapping("/team-gap/{projectId}")
    public TeamGapResponse getTeamGap(
            @PathVariable Long projectId,
            Authentication authentication) {

        String email = authentication.getName();

        return matchService.getTeamGap(
                projectId,
                email
        );
    }
}