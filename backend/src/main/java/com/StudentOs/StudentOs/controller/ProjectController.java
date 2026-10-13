package com.StudentOs.StudentOs.controller;

import com.StudentOs.StudentOs.entity.Project;
import com.StudentOs.StudentOs.service.ProjectService;

import jakarta.validation.constraints.NotBlank;

import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/projects")
@Validated
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }


    // =========================================================
    // CREATE PROJECT
    // =========================================================

    @PostMapping
    public Project createProject(
            Authentication authentication,

            @RequestParam
            @NotBlank(message = "Project title is required")
            String title,

            @RequestParam
            @NotBlank(message = "Project description is required")
            String description) {

        String email = authentication.getName();

        return projectService.createProject(
                email,
                title,
                description
        );
    }


    // =========================================================
    // GET ALL PROJECTS
    // =========================================================

    @GetMapping
    public List<Project> getAllProjects() {

        return projectService.getAllProjects();
    }


    // =========================================================
    // GET MY PROJECTS
    // =========================================================

    @GetMapping("/my")
    public List<Project> getMyProjects(
            Authentication authentication) {

        String email = authentication.getName();

        return projectService.getMyProjects(email);
    }


    // =========================================================
    // ADD REQUIRED SKILL
    // =========================================================

    @PostMapping("/{projectId}/skills")
    public Project addRequiredSkill(
            @PathVariable Long projectId,

            @RequestParam
            @NotBlank(message = "Skill name is required")
            String skillName,

            Authentication authentication) {

        String email = authentication.getName();

        return projectService.addRequiredSkill(
                projectId,
                skillName,
                email
        );
    }


    // =========================================================
    // DELETE PROJECT
    // =========================================================

    @DeleteMapping("/{projectId}")
    public String deleteProject(
            @PathVariable Long projectId,
            Authentication authentication) {

        String email = authentication.getName();

        return projectService.deleteProject(
                projectId,
                email
        );
    }
}