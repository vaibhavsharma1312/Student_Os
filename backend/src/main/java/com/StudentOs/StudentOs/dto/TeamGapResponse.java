package com.StudentOs.StudentOs.dto;

import java.util.List;

public class TeamGapResponse {

    private Long projectId;
    private String projectTitle;
    private int teamSize;
    private double coveragePercentage;
    private List<String> missingSkills;

    public TeamGapResponse() {
    }

    public TeamGapResponse(
            Long projectId,
            String projectTitle,
            int teamSize,
            double coveragePercentage,
            List<String> missingSkills) {

        this.projectId = projectId;
        this.projectTitle = projectTitle;
        this.teamSize = teamSize;
        this.coveragePercentage = coveragePercentage;
        this.missingSkills = missingSkills;
    }

    public Long getProjectId() {
        return projectId;
    }

    public String getProjectTitle() {
        return projectTitle;
    }

    public int getTeamSize() {
        return teamSize;
    }

    public double getCoveragePercentage() {
        return coveragePercentage;
    }

    public List<String> getMissingSkills() {
        return missingSkills;
    }
}