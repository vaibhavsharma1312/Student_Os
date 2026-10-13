package com.StudentOs.StudentOs.service;

import com.StudentOs.StudentOs.entity.Skill;
import com.StudentOs.StudentOs.entity.User;
import com.StudentOs.StudentOs.repository.SkillRepository;
import com.StudentOs.StudentOs.repository.UserRepository;

import org.springframework.stereotype.Service;

@Service
public class SkillService {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;

    public SkillService(
            UserRepository userRepository,
            SkillRepository skillRepository) {

        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
    }


    // =========================================================
    // ADD SKILL
    // =========================================================

    public String addSkill(
            String email,
            String skillName) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));


        // Find existing skill or create new one
        Skill skill = skillRepository.findByName(skillName)
                .orElseGet(() ->
                        skillRepository.save(
                                new Skill(skillName)
                        ));


        // Prevent duplicate skill for same user
        if (user.getSkills().contains(skill)) {

            throw new RuntimeException(
                    "Skill already added to your profile");
        }


        user.getSkills().add(skill);

        userRepository.save(user);

        return "Skill added successfully";
    }


    // =========================================================
    // REMOVE SKILL
    // =========================================================

    public String removeSkill(
            String email,
            String skillName) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));


        Skill skill = skillRepository.findByName(skillName)
                .orElseThrow(() ->
                        new RuntimeException("Skill not found"));


        // Check whether user actually has this skill
        if (!user.getSkills().contains(skill)) {

            throw new RuntimeException(
                    "Skill is not present in your profile");
        }


        user.getSkills().remove(skill);

        userRepository.save(user);

        return "Skill removed successfully";
    }
}