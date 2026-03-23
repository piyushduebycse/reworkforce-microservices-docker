package com.revworkforce.leaveservice.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LeaveTypeDto {
    private Long id;
    private String name;
    private String description;
    private boolean isPaid;
    private boolean isActive;
}
