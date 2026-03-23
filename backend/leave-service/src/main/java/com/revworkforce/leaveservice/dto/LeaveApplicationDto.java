package com.revworkforce.leaveservice.dto;

import com.revworkforce.leaveservice.entity.LeaveStatus;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LeaveApplicationDto {
    private Long id;
    private Long userId;
    private String employeeName;
    private Long managerId;
    private Long leaveTypeId;
    private String leaveTypeName;
    private LocalDate startDate;
    private LocalDate endDate;
    private int numberOfDays;
    private String reason;
    private LeaveStatus status;
    private String managerComment;
    private LocalDateTime appliedAt;
    private LocalDateTime reviewedAt;
}
