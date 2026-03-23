package com.revworkforce.employeemanagement.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DepartmentDto {
    private Long id;
    private String name;
    private String description;
    private Long headEmployeeId;
    private boolean isActive;
}
