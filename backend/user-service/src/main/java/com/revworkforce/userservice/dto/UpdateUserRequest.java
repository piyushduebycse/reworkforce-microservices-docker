package com.revworkforce.userservice.dto;

import com.revworkforce.userservice.entity.Role;
import lombok.Data;

@Data
public class UpdateUserRequest {
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private Role role;
    private Long managerId;
    private Long departmentId;
    private Long designationId;
    private Boolean isActive;
}
