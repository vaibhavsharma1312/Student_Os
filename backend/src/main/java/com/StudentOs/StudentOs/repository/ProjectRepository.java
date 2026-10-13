package com.StudentOs.StudentOs.repository;

import com.StudentOs.StudentOs.entity.Project;
import com.StudentOs.StudentOs.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByOwner(User owner);
}