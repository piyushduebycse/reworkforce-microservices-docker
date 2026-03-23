package com.revworkforce.userservice.dto;

import com.revworkforce.userservice.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String employeeId;
    private String firstName;
    private String lastName;
    private String email;
    private Role role;
    private Long managerId;
    private Long departmentId;
    private Long designationId;
    private String phoneNumber;
    private String profilePictureUrl;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
