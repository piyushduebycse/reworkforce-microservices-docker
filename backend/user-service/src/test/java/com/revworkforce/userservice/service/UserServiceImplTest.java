package com.revworkforce.userservice.service;

import com.revworkforce.userservice.dto.LoginRequest;
import com.revworkforce.userservice.dto.RegisterRequest;
import com.revworkforce.userservice.entity.Role;
import com.revworkforce.userservice.entity.User;
import com.revworkforce.userservice.exception.BusinessException;
import com.revworkforce.userservice.exception.ResourceNotFoundException;
import com.revworkforce.userservice.repository.UserRepository;
import com.revworkforce.userservice.security.JwtTokenProvider;
import com.revworkforce.userservice.service.impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtTokenProvider jwtTokenProvider;
    @Mock private AuthenticationManager authenticationManager;
    @InjectMocks private UserServiceImpl userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .employeeId("EMP-001")
                .firstName("Test")
                .lastName("User")
                .email("test@revworkforce.com")
                .password("encodedPassword")
                .role(Role.EMPLOYEE)
                .isActive(true)
                .build();
    }

    @Test
    void login_ValidCredentials_ShouldReturnAuthResponse() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@revworkforce.com");
        request.setPassword("password");

        when(authenticationManager.authenticate(any())).thenReturn(null);
        when(userRepository.findByEmail("test@revworkforce.com")).thenReturn(Optional.of(testUser));
        when(jwtTokenProvider.generateToken(testUser)).thenReturn("access-token");
        when(jwtTokenProvider.generateRefreshToken(testUser)).thenReturn("refresh-token");

        var response = userService.login(request);

        assertNotNull(response);
        assertEquals("access-token", response.getAccessToken());
        assertEquals("test@revworkforce.com", response.getEmail());
    }

    @Test
    void login_InactiveUser_ShouldThrowBusinessException() {
        testUser.setActive(false);
        LoginRequest request = new LoginRequest();
        request.setEmail("test@revworkforce.com");
        request.setPassword("password");

        when(authenticationManager.authenticate(any())).thenReturn(null);
        when(userRepository.findByEmail("test@revworkforce.com")).thenReturn(Optional.of(testUser));

        assertThrows(BusinessException.class, () -> userService.login(request));
    }

    @Test
    void register_EmailAlreadyExists_ShouldThrowBusinessException() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@revworkforce.com");
        request.setPassword("password");
        request.setFirstName("Test");
        request.setLastName("User");

        when(userRepository.existsByEmail("test@revworkforce.com")).thenReturn(true);

        assertThrows(BusinessException.class, () -> userService.register(request));
    }

    @Test
    void register_ValidRequest_ShouldCreateUser() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("newuser@revworkforce.com");
        request.setPassword("password");
        request.setFirstName("New");
        request.setLastName("User");
        request.setRole(Role.EMPLOYEE);

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.findMaxEmployeeIdNumber()).thenReturn(5);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtTokenProvider.generateToken(any())).thenReturn("token");
        when(jwtTokenProvider.generateRefreshToken(any())).thenReturn("refresh");

        var response = userService.register(request);

        assertNotNull(response);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void getUserById_NotFound_ShouldThrowResourceNotFoundException() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> userService.getUserById(99L));
    }

    @Test
    void deactivateUser_ExistingUser_ShouldSetInactive() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        userService.deactivateUser(1L);

        assertFalse(testUser.isActive());
        verify(userRepository).save(testUser);
    }
}
