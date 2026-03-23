package com.revworkforce.employeemanagement.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DesignationDto {
    private Long id;
    private String name;
    private String level;
    private Long departmentId;
    private boolean isActive;
}
