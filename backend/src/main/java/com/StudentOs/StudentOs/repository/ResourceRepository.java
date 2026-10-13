package com.StudentOs.StudentOs.repository;

import com.StudentOs.StudentOs.entity.Resource;
import com.StudentOs.StudentOs.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findByPostedBy(User user);
}