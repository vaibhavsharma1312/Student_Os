package com.StudentOs.StudentOs.repository;

import com.StudentOs.StudentOs.entity.Profile;

import com.StudentOs.StudentOs.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProfileRepository extends JpaRepository<Profile, Long> {

    Optional<Profile> findByUser(User user);
}