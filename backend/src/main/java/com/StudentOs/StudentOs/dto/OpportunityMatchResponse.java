package com.StudentOs.StudentOs.dto;

public class OpportunityMatchResponse {

    private Long opportunityId;
    private String opportunityTitle;
    private String type;
    private double matchPercentage;

    public OpportunityMatchResponse() {
    }

    public OpportunityMatchResponse(
            Long opportunityId,
            String opportunityTitle,
            String type,
            double matchPercentage) {

        this.opportunityId = opportunityId;
        this.opportunityTitle = opportunityTitle;
        this.type = type;
        this.matchPercentage = matchPercentage;
    }

    public Long getOpportunityId() {
        return opportunityId;
    }

    public String getOpportunityTitle() {
        return opportunityTitle;
    }

    public String getType() {
        return type;
    }

    public double getMatchPercentage() {
        return matchPercentage;
    }
}