package com.StudentOs.StudentOs.controller;

import com.StudentOs.StudentOs.entity.JoinRequest;
import com.StudentOs.StudentOs.entity.RequestStatus;
import com.StudentOs.StudentOs.service.JoinRequestService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/join-requests")
public class JoinRequestController {

    private final JoinRequestService joinRequestService;

    public JoinRequestController(
            JoinRequestService joinRequestService) {

        this.joinRequestService = joinRequestService;
    }


    // =========================================================
    // SEND JOIN REQUEST
    // =========================================================

    @PostMapping("/{projectId}")
    public JoinRequest sendRequest(
            @PathVariable Long projectId,
            Authentication authentication) {

        String email = authentication.getName();

        return joinRequestService.sendRequest(
                projectId,
                email
        );
    }


    // =========================================================
    // GET PROJECT REQUESTS
    // =========================================================

    @GetMapping("/project/{projectId}")
    public List<JoinRequest> getProjectRequests(
            @PathVariable Long projectId,
            Authentication authentication) {

        String email = authentication.getName();

        return joinRequestService.getProjectRequests(
                projectId,
                email
        );
    }


    // =========================================================
    // UPDATE REQUEST STATUS
    // =========================================================

    @PutMapping("/{requestId}")
    public JoinRequest updateRequestStatus(
            @PathVariable Long requestId,

            @RequestParam RequestStatus status,

            Authentication authentication) {

        String email = authentication.getName();

        return joinRequestService.updateRequestStatus(
                requestId,
                email,
                status
        );
    }
}