package com.StudentOs.StudentOs.controller;

import com.StudentOs.StudentOs.entity.Profile;
import com.StudentOs.StudentOs.service.ProfileService;

import jakarta.validation.constraints.NotBlank;

import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/profile")
@Validated
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }


    // =========================================================
    // CREATE PROFILE
    // =========================================================

    @PostMapping
    public Profile createProfile(
            Authentication authentication) {

        String email = authentication.getName();

        return profileService.createProfile(email);
    }


    // =========================================================
    // GET PROFILE
    // =========================================================

    @GetMapping
    public Profile getProfile(
            Authentication authentication) {

        String email = authentication.getName();

        return profileService.getProfile(email);
    }


    // =========================================================
    // UPDATE PROFILE
    // =========================================================

    @PutMapping
    public Profile updateProfile(
            Authentication authentication,

            @RequestParam
            @NotBlank(message = "Bio is required")
            String bio,

            @RequestParam
            @NotBlank(message = "College is required")
            String college,

            @RequestParam
            @NotBlank(message = "Branch is required")
            String branch,

            @RequestParam(required = false)
            String githubUrl,

            @RequestParam(required = false)
            String linkedinUrl) {

        String email = authentication.getName();

        return profileService.updateProfile(
                email,
                bio,
                college,
                branch,
                githubUrl,
                linkedinUrl
        );
    }
}