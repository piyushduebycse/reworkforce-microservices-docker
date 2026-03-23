package com.revworkforce.leaveservice.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LeaveBalanceDto {
    private Long id;
    private Long userId;
    private Long leaveTypeId;
    private String leaveTypeName;
    private int totalDays;
    private int usedDays;
    private int remainingDays;
    private int year;
}
