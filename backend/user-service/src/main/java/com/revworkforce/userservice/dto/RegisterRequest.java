package com.revworkforce.userservice.dto;

import com.revworkforce.userservice.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank private String firstName;
    @NotBlank private String lastName;
    @NotBlank @Email private String email;
    @NotBlank private String password;
    @NotNull private Role role;
    private Long managerId;
    private Long departmentId;
    private Long designationId;
    private String phoneNumber;
}
