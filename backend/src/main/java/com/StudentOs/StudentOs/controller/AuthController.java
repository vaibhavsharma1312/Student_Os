package com.StudentOs.StudentOs.controller;

import com.StudentOs.StudentOs.dto.AuthResponse;
import com.StudentOs.StudentOs.dto.LoginRequest;
import com.StudentOs.StudentOs.dto.RegisterRequest;
import com.StudentOs.StudentOs.service.AuthService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }


    // =========================================================
    // REGISTER
    // =========================================================

    @PostMapping("/register")
    public String register(
            @Valid @RequestBody RegisterRequest request) {

        return authService.register(request);
    }


    // =========================================================
    // LOGIN
    // =========================================================

    @PostMapping("/login")
    public AuthResponse login(
            @RequestBody LoginRequest request) {

        String token = authService.login(request);

        return new AuthResponse(token);
    }
}