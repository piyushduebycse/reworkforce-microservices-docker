package com.revworkforce.reportingservice.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class HrDashboardDto {
    private long totalEmployees;
    private long activeEmployees;
    private long onLeaveToday;
    private long pendingLeaveRequests;
    private long openGoals;
    private long completedGoalsThisMonth;
    private double averagePerformanceRating;
    private long newJoineesThisMonth;
    private List<Map<String, Object>> departmentWiseHeadcount;
    private List<Map<String, Object>> leaveUtilizationByType;
}
