package com.StudentOs.StudentOs.repository;

import com.StudentOs.StudentOs.entity.Opportunity;
import com.StudentOs.StudentOs.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OpportunityRepository
        extends JpaRepository<Opportunity, Long> {

    List<Opportunity> findByPostedBy(User user);
}