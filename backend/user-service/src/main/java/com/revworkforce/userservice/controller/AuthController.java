package com.revworkforce.userservice.controller;

import com.revworkforce.userservice.dto.*;
import com.revworkforce.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = userService.login(request);
        return ResponseEntity.ok(ApiResponse.<AuthResponse>builder()
                .success(true).message("Login successful").data(response)
                .statusCode(200).build());
    }

    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = userService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<AuthResponse>builder()
                .success(true).message("User registered successfully").data(response)
                .statusCode(201).build());
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@RequestHeader("Refresh-Token") String refreshToken) {
        AuthResponse response = userService.refreshToken(refreshToken);
        return ResponseEntity.ok(ApiResponse.<AuthResponse>builder()
                .success(true).message("Token refreshed").data(response)
                .statusCode(200).build());
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> me(@AuthenticationPrincipal UserDetails userDetails) {
        UserDto user = userService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.<UserDto>builder()
                .success(true).message("Current user").data(user)
                .statusCode(200).build());
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true).message("Logged out successfully")
                .statusCode(200).build());
    }
}
