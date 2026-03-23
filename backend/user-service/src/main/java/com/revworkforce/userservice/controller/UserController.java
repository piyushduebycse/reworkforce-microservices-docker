package com.revworkforce.userservice.controller;

import com.revworkforce.userservice.dto.*;
import com.revworkforce.userservice.entity.Role;
import com.revworkforce.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<UserDto>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<UserDto> users = userService.getAllUsers(PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.<Page<UserDto>>builder()
                .success(true).message("Users retrieved").data(users).statusCode(200).build());
    }

    @GetMapping("/users/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<UserDto>builder()
                .success(true).message("User retrieved").data(userService.getUserById(id)).statusCode(200).build());
    }

    @PutMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(@PathVariable Long id,
                                                            @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(ApiResponse.<UserDto>builder()
                .success(true).message("User updated").data(userService.updateUser(id, request)).statusCode(200).build());
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivateUser(@PathVariable Long id) {
        userService.deactivateUser(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true).message("User deactivated").statusCode(200).build());
    }

    @GetMapping("/users/directory")
    public ResponseEntity<ApiResponse<List<UserDto>>> getDirectory() {
        return ResponseEntity.ok(ApiResponse.<List<UserDto>>builder()
                .success(true).message("Employee directory").data(userService.getActiveDirectory()).statusCode(200).build());
    }

    @GetMapping("/users/search")
    public ResponseEntity<ApiResponse<List<UserDto>>> searchUsers(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.<List<UserDto>>builder()
                .success(true).message("Search results").data(userService.searchUsers(q)).statusCode(200).build());
    }

    @GetMapping("/users/{id}/reportees")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<UserDto>>> getReportees(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<List<UserDto>>builder()
                .success(true).message("Reportees retrieved").data(userService.getReportees(id)).statusCode(200).build());
    }

    @GetMapping("/profiles/me")
    public ResponseEntity<ApiResponse<UserDto>> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.<UserDto>builder()
                .success(true).message("Profile retrieved").data(userService.getCurrentUser(userDetails.getUsername())).statusCode(200).build());
    }

    @PutMapping("/profiles/me")
    public ResponseEntity<ApiResponse<UserDto>> updateMyProfile(@AuthenticationPrincipal UserDetails userDetails,
                                                                 @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.<UserDto>builder()
                .success(true).message("Profile updated").data(userService.updateProfile(userDetails.getUsername(), request)).statusCode(200).build());
    }

    @GetMapping("/users/by-role")
    public ResponseEntity<ApiResponse<List<UserDto>>> getUsersByRole(@RequestParam Role role) {
        return ResponseEntity.ok(ApiResponse.<List<UserDto>>builder()
                .success(true).message("Users by role").data(userService.getUsersByRole(role)).statusCode(200).build());
    }

    @PutMapping("/users/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> activateUser(@PathVariable Long id) {
        userService.activateUser(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("User activated").statusCode(200).build());
    }
}
