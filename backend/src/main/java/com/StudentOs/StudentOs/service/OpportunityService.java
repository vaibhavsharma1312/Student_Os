package com.StudentOs.StudentOs.service;

import com.StudentOs.StudentOs.entity.Opportunity;
import com.StudentOs.StudentOs.entity.Skill;
import com.StudentOs.StudentOs.entity.User;
import com.StudentOs.StudentOs.repository.OpportunityRepository;
import com.StudentOs.StudentOs.repository.SkillRepository;
import com.StudentOs.StudentOs.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OpportunityService {

    private final OpportunityRepository opportunityRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;

    public OpportunityService(
            OpportunityRepository opportunityRepository,
            UserRepository userRepository,
            SkillRepository skillRepository) {

        this.opportunityRepository = opportunityRepository;
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
    }


    // =========================================================
    // CREATE OPPORTUNITY
    // =========================================================

    public Opportunity createOpportunity(
            String email,
            String title,
            String type,
            String description,
            String link) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Opportunity opportunity = new Opportunity(
                title,
                type,
                description,
                link,
                user
        );

        return opportunityRepository.save(opportunity);
    }


    // =========================================================
    // GET ALL OPPORTUNITIES
    // =========================================================

    public List<Opportunity> getAllOpportunities() {

        return opportunityRepository.findAll();
    }


    // =========================================================
    // GET MY OPPORTUNITIES
    // =========================================================

    public List<Opportunity> getMyOpportunities(
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return opportunityRepository.findByPostedBy(user);
    }


    // =========================================================
    // ADD REQUIRED SKILL
    // =========================================================

    public Opportunity addRequiredSkill(
            Long opportunityId,
            String skillName,
            String email) {

        Opportunity opportunity =
                opportunityRepository.findById(opportunityId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Opportunity not found"));

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"));


        // Only owner can add required skills
        if (!opportunity.getPostedBy()
                .getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "Only opportunity owner can add required skills");
        }


        // Find existing skill or create new one
        Skill skill =
                skillRepository.findByName(skillName)
                        .orElseGet(() ->
                                skillRepository.save(
                                        new Skill(skillName)
                                ));


        // Prevent duplicate skill
        if (opportunity.getRequiredSkills()
                .contains(skill)) {

            throw new RuntimeException(
                    "Skill already added to opportunity");
        }


        opportunity.getRequiredSkills().add(skill);

        return opportunityRepository.save(opportunity);
    }


    // =========================================================
    // DELETE OPPORTUNITY
    // =========================================================

    public String deleteOpportunity(
            Long opportunityId,
            String email) {

        Opportunity opportunity =
                opportunityRepository.findById(opportunityId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Opportunity not found"));

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"));


        // Only owner can delete
        if (!opportunity.getPostedBy()
                .getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "Only opportunity owner can delete opportunity");
        }


        opportunityRepository.delete(opportunity);

        return "Opportunity deleted successfully";
    }
}