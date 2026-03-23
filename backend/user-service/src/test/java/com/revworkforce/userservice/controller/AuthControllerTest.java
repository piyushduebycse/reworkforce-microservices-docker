package com.revworkforce.userservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.revworkforce.userservice.dto.AuthResponse;
import com.revworkforce.userservice.dto.LoginRequest;
import com.revworkforce.userservice.entity.Role;
import com.revworkforce.userservice.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired MockMvc mockMvc;
    @MockBean UserService userService;
    @Autowired ObjectMapper objectMapper;

    @Test
    void login_ValidRequest_ReturnsOk() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@revworkforce.com");
        request.setPassword("password");

        AuthResponse response = AuthResponse.builder()
                .accessToken("token")
                .email("test@revworkforce.com")
                .role(Role.EMPLOYEE)
                .build();

        when(userService.login(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("token"));
    }
}
