package com.StudentOs.StudentOs.service;

import com.StudentOs.StudentOs.entity.Resource;
import com.StudentOs.StudentOs.entity.User;
import com.StudentOs.StudentOs.repository.ResourceRepository;
import com.StudentOs.StudentOs.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;

    public ResourceService(
            ResourceRepository resourceRepository,
            UserRepository userRepository) {

        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
    }


    // =========================================================
    // CREATE RESOURCE
    // =========================================================

    public Resource createResource(
            String email,
            String title,
            String type,
            String description,
            String link) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Resource resource = new Resource(
                title,
                type,
                description,
                link,
                user
        );

        return resourceRepository.save(resource);
    }


    // =========================================================
    // GET ALL RESOURCES
    // =========================================================

    public List<Resource> getAllResources() {

        return resourceRepository.findAll();
    }


    // =========================================================
    // GET MY RESOURCES
    // =========================================================

    public List<Resource> getMyResources(
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return resourceRepository.findByPostedBy(user);
    }


    // =========================================================
    // DELETE RESOURCE
    // =========================================================

    public String deleteResource(
            Long resourceId,
            String email) {

        Resource resource =
                resourceRepository.findById(resourceId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Resource not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Only resource owner can delete it
        if (!resource.getPostedBy()
                .getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "Only resource owner can delete resource");
        }

        resourceRepository.delete(resource);

        return "Resource deleted successfully";
    }
}