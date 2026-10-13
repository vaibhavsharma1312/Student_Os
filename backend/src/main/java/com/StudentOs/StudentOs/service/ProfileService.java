package com.StudentOs.StudentOs.service;

import com.StudentOs.StudentOs.entity.Profile;
import com.StudentOs.StudentOs.entity.User;
import com.StudentOs.StudentOs.repository.ProfileRepository;
import com.StudentOs.StudentOs.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    public ProfileService(
            ProfileRepository profileRepository,
            UserRepository userRepository) {

        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
    }


    // =========================================================
    // CREATE PROFILE
    // =========================================================

    public Profile createProfile(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));


        // Prevent duplicate profile
        if (profileRepository.findByUser(user).isPresent()) {

            throw new ResponseStatusException(HttpStatus.CONFLICT, "Profile already exists");
        }


        Profile profile = new Profile(user);

        return profileRepository.save(profile);
    }


    // =========================================================
    // GET PROFILE
    // =========================================================

    public Profile getProfile(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return profileRepository.findByUser(user)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
    }


    // =========================================================
    // UPDATE PROFILE
    // =========================================================

    public Profile updateProfile(
            String email,
            String bio,
            String college,
            String branch,
            String githubUrl,
            String linkedinUrl) {

        Profile profile = getProfile(email);


        profile.setBio(bio);
        profile.setCollege(college);
        profile.setBranch(branch);
        profile.setGithubUrl(githubUrl);
        profile.setLinkedinUrl(linkedinUrl);


        return profileRepository.save(profile);
    }
}
