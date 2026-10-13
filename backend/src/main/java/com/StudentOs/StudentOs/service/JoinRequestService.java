package com.StudentOs.StudentOs.service;

import com.StudentOs.StudentOs.entity.JoinRequest;
import com.StudentOs.StudentOs.entity.Project;
import com.StudentOs.StudentOs.entity.RequestStatus;
import com.StudentOs.StudentOs.entity.User;
import com.StudentOs.StudentOs.repository.JoinRequestRepository;
import com.StudentOs.StudentOs.repository.ProjectRepository;
import com.StudentOs.StudentOs.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JoinRequestService {

    private final JoinRequestRepository joinRequestRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public JoinRequestService(
            JoinRequestRepository joinRequestRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository) {

        this.joinRequestRepository = joinRequestRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }


    // =========================================================
    // SEND JOIN REQUEST
    // =========================================================

    public JoinRequest sendRequest(
            Long projectId,
            String email) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new RuntimeException("Project not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));


        // Project owner cannot join his own project
        if (project.getOwner().getId().equals(user.getId())) {

            throw new RuntimeException(
                    "Project owner cannot send join request");
        }


        // Prevent duplicate request
        if (joinRequestRepository
                .findByProjectAndUser(project, user)
                .isPresent()) {

            throw new RuntimeException(
                    "Join request already exists");
        }


        JoinRequest request =
                new JoinRequest(
                        project,
                        user,
                        RequestStatus.PENDING
                );

        return joinRequestRepository.save(request);
    }


    // =========================================================
    // GET PROJECT REQUESTS
    // =========================================================

    public List<JoinRequest> getProjectRequests(
            Long projectId,
            String email) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new RuntimeException("Project not found"));

        User owner = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));


        // Only owner can view requests
        if (!project.getOwner()
                .getId()
                .equals(owner.getId())) {

            throw new RuntimeException(
                    "Only project owner can view requests");
        }

        return joinRequestRepository.findByProject(project);
    }


    // =========================================================
    // UPDATE REQUEST STATUS
    // =========================================================

    public JoinRequest updateRequestStatus(
            Long requestId,
            String email,
            RequestStatus status) {

        JoinRequest request =
                joinRequestRepository.findById(requestId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Request not found"));

        User owner = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));


        // Only project owner can update
        if (!request.getProject()
                .getOwner()
                .getId()
                .equals(owner.getId())) {

            throw new RuntimeException(
                    "Only project owner can update request");
        }


        // Prevent changing an already finalized request
        if (request.getStatus() != RequestStatus.PENDING) {

            throw new RuntimeException(
                    "Request has already been finalized");
        }


        request.setStatus(status);

        return joinRequestRepository.save(request);
    }
}