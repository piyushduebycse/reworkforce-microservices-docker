package com.revworkforce.leaveservice.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LeaveQuotaDto {
    private Long id;
    private Long leaveTypeId;
    private String leaveTypeName;
    private String role;
    private int totalDays;
    private int year;
}
