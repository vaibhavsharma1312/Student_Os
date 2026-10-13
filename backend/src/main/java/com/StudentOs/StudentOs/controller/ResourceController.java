package com.StudentOs.StudentOs.controller;

import com.StudentOs.StudentOs.entity.Resource;
import com.StudentOs.StudentOs.service.ResourceService;

import jakarta.validation.constraints.NotBlank;

import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/resources")
@Validated
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(
            ResourceService resourceService) {

        this.resourceService = resourceService;
    }


    // =========================================================
    // CREATE RESOURCE
    // =========================================================

    @PostMapping
    public Resource createResource(
            Authentication authentication,

            @RequestParam
            @NotBlank(message = "Resource title is required")
            String title,

            @RequestParam
            @NotBlank(message = "Resource type is required")
            String type,

            @RequestParam
            @NotBlank(message = "Resource description is required")
            String description,

            @RequestParam(required = false)
            String link) {

        String email = authentication.getName();

        return resourceService.createResource(
                email,
                title,
                type,
                description,
                link
        );
    }


    // =========================================================
    // GET ALL RESOURCES
    // =========================================================

    @GetMapping
    public List<Resource> getAllResources() {

        return resourceService.getAllResources();
    }


    // =========================================================
    // GET MY RESOURCES
    // =========================================================

    @GetMapping("/my")
    public List<Resource> getMyResources(
            Authentication authentication) {

        String email = authentication.getName();

        return resourceService.getMyResources(email);
    }


    // =========================================================
    // DELETE RESOURCE
    // =========================================================

    @DeleteMapping("/{resourceId}")
    public String deleteResource(
            @PathVariable Long resourceId,
            Authentication authentication) {

        String email = authentication.getName();

        return resourceService.deleteResource(
                resourceId,
                email
        );
    }
}