package com.revworkforce.userservice.service.impl;

import com.revworkforce.userservice.dto.*;
import com.revworkforce.userservice.entity.Role;
import com.revworkforce.userservice.entity.User;
import com.revworkforce.userservice.exception.BusinessException;
import com.revworkforce.userservice.exception.ResourceNotFoundException;
import com.revworkforce.userservice.repository.UserRepository;
import com.revworkforce.userservice.security.JwtTokenProvider;
import com.revworkforce.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!user.isActive()) {
            throw new BusinessException("Account is deactivated. Contact admin.");
        }
        return AuthResponse.builder()
                .accessToken(jwtTokenProvider.generateToken(user))
                .refreshToken(jwtTokenProvider.generateRefreshToken(user))
                .tokenType("Bearer")
                .userId(user.getId())
                .employeeId(user.getEmployeeId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .build();
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email already in use: " + request.getEmail());
        }
        String employeeId = generateEmployeeId();
        User user = User.builder()
                .employeeId(employeeId)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : Role.EMPLOYEE)
                .managerId(request.getManagerId())
                .departmentId(request.getDepartmentId())
                .designationId(request.getDesignationId())
                .phoneNumber(request.getPhoneNumber())
                .isActive(true)
                .build();
        user = userRepository.save(user);
        return AuthResponse.builder()
                .accessToken(jwtTokenProvider.generateToken(user))
                .refreshToken(jwtTokenProvider.generateRefreshToken(user))
                .tokenType("Bearer")
                .userId(user.getId())
                .employeeId(user.getEmployeeId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .build();
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtTokenProvider.isTokenValid(refreshToken)) {
            throw new BusinessException("Invalid refresh token");
        }
        String email = jwtTokenProvider.getEmailFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return AuthResponse.builder()
                .accessToken(jwtTokenProvider.generateToken(user))
                .refreshToken(jwtTokenProvider.generateRefreshToken(user))
                .tokenType("Bearer")
                .userId(user.getId())
                .employeeId(user.getEmployeeId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toDto(user);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserDto> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        return toDto(userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id)));
    }

    @Override
    public UserDto updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getRole() != null) user.setRole(request.getRole());
        if (request.getManagerId() != null) user.setManagerId(request.getManagerId());
        if (request.getDepartmentId() != null) user.setDepartmentId(request.getDepartmentId());
        if (request.getDesignationId() != null) user.setDesignationId(request.getDesignationId());
        if (request.getIsActive() != null) user.setActive(request.getIsActive());
        return toDto(userRepository.save(user));
    }

    @Override
    public void deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setActive(false);
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> getActiveDirectory() {
        return userRepository.findByIsActiveTrue().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> searchUsers(String query) {
        return userRepository.searchActiveUsers(query).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> getReportees(Long managerId) {
        return userRepository.findByManagerId(managerId).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public UserDto updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getProfilePictureUrl() != null) user.setProfilePictureUrl(request.getProfilePictureUrl());
        return toDto(userRepository.save(user));
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserByIdInternal(Long id) {
        return toDto(userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> getUsersByIds(List<Long> ids) {
        return userRepository.findByIdIn(ids).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.Map<String, Object> getUserStats() {
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("activeUsers", userRepository.countByIsActiveTrue());
        java.time.LocalDateTime startOfMonth = java.time.LocalDate.now().withDayOfMonth(1).atStartOfDay();
        stats.put("newThisMonth", userRepository.countByCreatedAtAfter(startOfMonth));
        java.util.List<java.util.Map<String, Object>> byRole = new java.util.ArrayList<>();
        for (Object[] row : userRepository.countActiveByRole()) {
            java.util.Map<String, Object> entry = new java.util.HashMap<>();
            entry.put("role", row[0].toString());
            entry.put("count", row[1]);
            byRole.add(entry);
        }
        stats.put("byRole", byRole);
        return stats;
    }

    private String generateEmployeeId() {
        Integer maxNum = userRepository.findMaxEmployeeIdNumber();
        int nextNum = (maxNum == null ? 0 : maxNum) + 1;
        return String.format("EMP-%03d", nextNum);
    }

    private UserDto toDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .employeeId(user.getEmployeeId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .managerId(user.getManagerId())
                .departmentId(user.getDepartmentId())
                .designationId(user.getDesignationId())
                .phoneNumber(user.getPhoneNumber())
                .profilePictureUrl(user.getProfilePictureUrl())
                .isActive(user.isActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
