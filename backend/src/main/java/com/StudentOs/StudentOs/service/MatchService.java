package com.StudentOs.StudentOs.service;

import com.StudentOs.StudentOs.dto.OpportunityMatchResponse;
import com.StudentOs.StudentOs.dto.ProjectMatchResponse;
import com.StudentOs.StudentOs.dto.SkillGapResponse;
import com.StudentOs.StudentOs.dto.TeamGapResponse;

import com.StudentOs.StudentOs.entity.Opportunity;
import com.StudentOs.StudentOs.entity.Project;
import com.StudentOs.StudentOs.entity.RequestStatus;
import com.StudentOs.StudentOs.entity.Skill;
import com.StudentOs.StudentOs.entity.User;

import com.StudentOs.StudentOs.repository.JoinRequestRepository;
import com.StudentOs.StudentOs.repository.OpportunityRepository;
import com.StudentOs.StudentOs.repository.ProjectRepository;
import com.StudentOs.StudentOs.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class MatchService {

    private final ProjectRepository projectRepository;
    private final OpportunityRepository opportunityRepository;
    private final UserRepository userRepository;
    private final JoinRequestRepository joinRequestRepository;

    public MatchService(
            ProjectRepository projectRepository,
            OpportunityRepository opportunityRepository,
            UserRepository userRepository,
            JoinRequestRepository joinRequestRepository) {

        this.projectRepository = projectRepository;
        this.opportunityRepository = opportunityRepository;
        this.userRepository = userRepository;
        this.joinRequestRepository = joinRequestRepository;
    }


    // =========================================================
    // MATCH WITH ONE PROJECT
    // =========================================================

    public double calculateMatch(
            Long projectId,
            String email) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new RuntimeException("Project not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return calculatePercentage(
                project.getRequiredSkills(),
                user.getSkills()
        );
    }


    // =========================================================
    // MATCH USER WITH ALL PROJECTS
    // =========================================================

    public List<ProjectMatchResponse> getProjectMatches(
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        List<Project> projects =
                projectRepository.findAll();

        List<ProjectMatchResponse> responses =
                new ArrayList<>();

        for (Project project : projects) {

            double percentage = calculatePercentage(
                    project.getRequiredSkills(),
                    user.getSkills()
            );

            responses.add(
                    new ProjectMatchResponse(
                            project.getId(),
                            project.getTitle(),
                            percentage
                    )
            );
        }

        // Highest match first
        responses.sort(
                (a, b) -> Double.compare(
                        b.getMatchPercentage(),
                        a.getMatchPercentage()
                )
        );

        return responses;
    }


    // =========================================================
    // MATCH USER WITH ALL OPPORTUNITIES
    // =========================================================

    public List<OpportunityMatchResponse> getOpportunityMatches(
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        List<Opportunity> opportunities =
                opportunityRepository.findAll();

        List<OpportunityMatchResponse> responses =
                new ArrayList<>();

        for (Opportunity opportunity : opportunities) {

            double percentage = calculatePercentage(
                    opportunity.getRequiredSkills(),
                    user.getSkills()
            );

            responses.add(
                    new OpportunityMatchResponse(
                            opportunity.getId(),
                            opportunity.getTitle(),
                            opportunity.getType(),
                            percentage
                    )
            );
        }

        // Highest match first
        responses.sort(
                (a, b) -> Double.compare(
                        b.getMatchPercentage(),
                        a.getMatchPercentage()
                )
        );

        return responses;
    }


    // =========================================================
    // INDIVIDUAL SKILL GAP ANALYSIS
    // =========================================================

    public SkillGapResponse getSkillGap(
            Long projectId,
            String email) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new RuntimeException("Project not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Set<Skill> requiredSkills =
                project.getRequiredSkills();

        Set<Skill> userSkills =
                user.getSkills();

        double percentage =
                calculatePercentage(
                        requiredSkills,
                        userSkills
                );

        Set<Long> userSkillIds =
                new HashSet<>();

        for (Skill skill : userSkills) {
            userSkillIds.add(skill.getId());
        }

        List<String> missingSkills =
                new ArrayList<>();

        for (Skill skill : requiredSkills) {

            if (!userSkillIds.contains(skill.getId())) {
                missingSkills.add(skill.getName());
            }
        }

        return new SkillGapResponse(
                project.getId(),
                project.getTitle(),
                percentage,
                missingSkills
        );
    }


    // =========================================================
    // TEAM GAP ANALYSIS
    // =========================================================

    public TeamGapResponse getTeamGap(
            Long projectId,
            String email) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new RuntimeException("Project not found"));

        User owner = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));


        // Only project owner can view team gap
        if (!project.getOwner()
                .getId()
                .equals(owner.getId())) {

            throw new RuntimeException(
                    "Only project owner can view team gap");
        }


        // Combined team skills
        Set<Skill> teamSkills =
                new HashSet<>();


        // Add owner's skills
        teamSkills.addAll(
                project.getOwner().getSkills()
        );


        // Get project join requests
        var requests =
                joinRequestRepository.findByProject(project);


        // Add accepted members' skills
        requests.stream()
                .filter(request ->
                        request.getStatus()
                                == RequestStatus.ACCEPTED)
                .forEach(request ->
                        teamSkills.addAll(
                                request.getUser().getSkills()
                        )
                );


        // Calculate team coverage
        double percentage =
                calculatePercentage(
                        project.getRequiredSkills(),
                        teamSkills
                );


        // Find missing skills
        Set<Long> teamSkillIds =
                new HashSet<>();

        for (Skill skill : teamSkills) {
            teamSkillIds.add(skill.getId());
        }


        List<String> missingSkills =
                new ArrayList<>();

        for (Skill skill :
                project.getRequiredSkills()) {

            if (!teamSkillIds.contains(
                    skill.getId())) {

                missingSkills.add(
                        skill.getName()
                );
            }
        }


        // Calculate team size
        int teamSize = 1;

        teamSize += (int) requests.stream()
                .filter(request ->
                        request.getStatus()
                                == RequestStatus.ACCEPTED)
                .count();


        return new TeamGapResponse(
                project.getId(),
                project.getTitle(),
                teamSize,
                percentage,
                missingSkills
        );
    }


    // =========================================================
    // COMMON MATCHING LOGIC
    // =========================================================

    private double calculatePercentage(
            Set<Skill> requiredSkills,
            Set<Skill> userSkills) {

        // No required skills means no skill gap
        if (requiredSkills.isEmpty()) {
            return 100.0;
        }


        // Store user's skill IDs
        Set<Long> userSkillIds =
                new HashSet<>();

        for (Skill skill : userSkills) {

            userSkillIds.add(
                    skill.getId()
            );
        }


        // Count matched skills
        int matchedSkills = 0;

        for (Skill skill : requiredSkills) {

            if (userSkillIds.contains(
                    skill.getId())) {

                matchedSkills++;
            }
        }


        // Calculate percentage
        double percentage =
                (matchedSkills * 100.0)
                        / requiredSkills.size();


        // Round to 2 decimal places
        return Math.round(
                percentage * 100.0
        ) / 100.0;
    }
}