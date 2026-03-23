package com.revworkforce.reportingservice.controller;

import com.revworkforce.reportingservice.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController @RequestMapping("/api/reports") @RequiredArgsConstructor
public class ReportController {

    @GetMapping("/hr-dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<HrDashboardDto>> getHrDashboard() {
        // Aggregate data from other services via Feign
        // For now returning a structured response with placeholder data
        // In production, this would call user-service, leave-service, performance-service
        HrDashboardDto dashboard = HrDashboardDto.builder()
                .totalEmployees(0L)
                .activeEmployees(0L)
                .onLeaveToday(0L)
                .pendingLeaveRequests(0L)
                .openGoals(0L)
                .completedGoalsThisMonth(0L)
                .averagePerformanceRating(0.0)
                .newJoineesThisMonth(0L)
                .departmentWiseHeadcount(new ArrayList<>())
                .leaveUtilizationByType(new ArrayList<>())
                .build();
        return ResponseEntity.ok(ApiResponse.success("HR Dashboard", dashboard));
    }

    @GetMapping("/headcount")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHeadcount() {
        Map<String, Object> data = new HashMap<>();
        data.put("total", 0);
        data.put("active", 0);
        data.put("inactive", 0);
        return ResponseEntity.ok(ApiResponse.success("Headcount", data));
    }

    @GetMapping("/leave-utilization")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getLeaveUtilization() {
        return ResponseEntity.ok(ApiResponse.success("Leave utilization", new ArrayList<>()));
    }

    @GetMapping("/performance-summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPerformanceSummary() {
        Map<String, Object> data = new HashMap<>();
        data.put("averageRating", 0.0);
        data.put("totalReviews", 0);
        return ResponseEntity.ok(ApiResponse.success("Performance summary", data));
    }

    @GetMapping("/goal-completion")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getGoalCompletion() {
        Map<String, Object> data = new HashMap<>();
        data.put("completionRate", 0.0);
        data.put("totalGoals", 0);
        data.put("completedGoals", 0);
        return ResponseEntity.ok(ApiResponse.success("Goal completion", data));
    }
}
