package com.StudentOs.StudentOs.dto;

import java.util.List;

public class SkillGapResponse {

    private Long projectId;
    private String projectTitle;
    private double matchPercentage;
    private List<String> missingSkills;

    public SkillGapResponse() {
    }

    public SkillGapResponse(
            Long projectId,
            String projectTitle,
            double matchPercentage,
            List<String> missingSkills) {

        this.projectId = projectId;
        this.projectTitle = projectTitle;
        this.matchPercentage = matchPercentage;
        this.missingSkills = missingSkills;
    }

    public Long getProjectId() {
        return projectId;
    }

    public String getProjectTitle() {
        return projectTitle;
    }

    public double getMatchPercentage() {
        return matchPercentage;
    }

    public List<String> getMissingSkills() {
        return missingSkills;
    }
}