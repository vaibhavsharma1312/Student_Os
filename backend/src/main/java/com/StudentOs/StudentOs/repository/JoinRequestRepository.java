package com.StudentOs.StudentOs.repository;

import com.StudentOs.StudentOs.entity.JoinRequest;
import com.StudentOs.StudentOs.entity.Project;
import com.StudentOs.StudentOs.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JoinRequestRepository extends JpaRepository<JoinRequest, Long> {

    Optional<JoinRequest> findByProjectAndUser(Project project, User user);

    List<JoinRequest> findByProject(Project project);

    List<JoinRequest> findByUser(User user);
}
