package com.revworkforce.leaveservice.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserDto {
    private Long id;
    private String employeeId;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private Long managerId;
}
