package com.StudentOs.StudentOs.service;

import com.StudentOs.StudentOs.dto.LoginRequest;
import com.StudentOs.StudentOs.dto.RegisterRequest;
import com.StudentOs.StudentOs.entity.Role;
import com.StudentOs.StudentOs.entity.User;
import com.StudentOs.StudentOs.repository.UserRepository;
import com.StudentOs.StudentOs.security.JwtService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public String register(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());

        // Password ko plain text mein store nahi karna
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        user.setRole(Role.STUDENT);

        userRepository.save(user);

        return "Registration successful";
    }

    public String login(LoginRequest request) {

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new RuntimeException("Invalid email or password");
        }

        return jwtService.generateToken(user.getEmail());
    }
}