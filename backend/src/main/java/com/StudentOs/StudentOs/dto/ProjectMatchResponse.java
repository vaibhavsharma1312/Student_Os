package com.StudentOs.StudentOs.dto;

public class ProjectMatchResponse {

    private Long projectId;
    private String projectTitle;
    private double matchPercentage;

    public ProjectMatchResponse() {
    }

    public ProjectMatchResponse(
            Long projectId,
            String projectTitle,
            double matchPercentage) {

        this.projectId = projectId;
        this.projectTitle = projectTitle;
        this.matchPercentage = matchPercentage;
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
}