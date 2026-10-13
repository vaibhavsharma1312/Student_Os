package com.StudentOs.StudentOs.service;

import com.StudentOs.StudentOs.entity.Project;
import com.StudentOs.StudentOs.entity.Skill;
import com.StudentOs.StudentOs.entity.User;
import com.StudentOs.StudentOs.repository.ProjectRepository;
import com.StudentOs.StudentOs.repository.SkillRepository;
import com.StudentOs.StudentOs.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;

    public ProjectService(
            ProjectRepository projectRepository,
            UserRepository userRepository,
            SkillRepository skillRepository) {

        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
    }


    // =========================================================
    // CREATE PROJECT
    // =========================================================

    public Project createProject(
            String email,
            String title,
            String description) {

        User owner = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Project project =
                new Project(
                        title,
                        description,
                        owner
                );

        return projectRepository.save(project);
    }


    // =========================================================
    // GET ALL PROJECTS
    // =========================================================

    public List<Project> getAllProjects() {

        return projectRepository.findAll();
    }


    // =========================================================
    // GET MY PROJECTS
    // =========================================================

    public List<Project> getMyProjects(
            String email) {

        User owner = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return projectRepository.findByOwner(owner);
    }


    // =========================================================
    // ADD REQUIRED SKILL
    // =========================================================

    public Project addRequiredSkill(
            Long projectId,
            String skillName,
            String email) {

        Project project =
                projectRepository.findById(projectId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Project not found"));

        User owner =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"));


        // Only project owner can add skills
        if (!project.getOwner()
                .getId()
                .equals(owner.getId())) {

            throw new RuntimeException(
                    "Only project owner can add required skills");
        }


        // Find existing skill or create new one
        Skill skill =
                skillRepository.findByName(skillName)
                        .orElseGet(() ->
                                skillRepository.save(
                                        new Skill(skillName)
                                ));


        // Prevent duplicate skill
        if (project.getRequiredSkills()
                .contains(skill)) {

            throw new RuntimeException(
                    "Skill already added to project");
        }


        project.getRequiredSkills().add(skill);

        return projectRepository.save(project);
    }


    // =========================================================
    // DELETE PROJECT
    // =========================================================

    public String deleteProject(
            Long projectId,
            String email) {

        Project project =
                projectRepository.findById(projectId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Project not found"));

        User owner =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"));


        // Only owner can delete
        if (!project.getOwner()
                .getId()
                .equals(owner.getId())) {

            throw new RuntimeException(
                    "Only project owner can delete project");
        }


        projectRepository.delete(project);

        return "Project deleted successfully";
    }
}