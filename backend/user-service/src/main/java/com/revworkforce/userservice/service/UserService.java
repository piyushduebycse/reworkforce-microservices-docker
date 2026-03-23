package com.revworkforce.userservice.service;

import com.revworkforce.userservice.dto.*;
import com.revworkforce.userservice.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {
    AuthResponse login(LoginRequest request);
    AuthResponse register(RegisterRequest request);
    AuthResponse refreshToken(String refreshToken);
    UserDto getCurrentUser(String email);
    Page<UserDto> getAllUsers(Pageable pageable);
    UserDto getUserById(Long id);
    UserDto updateUser(Long id, UpdateUserRequest request);
    void deactivateUser(Long id);
    List<UserDto> getActiveDirectory();
    List<UserDto> searchUsers(String query);
    List<UserDto> getReportees(Long managerId);
    UserDto updateProfile(String email, UpdateProfileRequest request);
    UserDto getUserByIdInternal(Long id);
    List<UserDto> getUsersByIds(List<Long> ids);
    java.util.Map<String, Object> getUserStats();
}
