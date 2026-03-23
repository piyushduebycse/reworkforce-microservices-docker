package com.revworkforce.reportingservice.controller;

import com.revworkforce.reportingservice.dto.*;
import com.revworkforce.reportingservice.feign.LeaveServiceClient;
import com.revworkforce.reportingservice.feign.PerformanceServiceClient;
import com.revworkforce.reportingservice.feign.UserServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportController {

    private final UserServiceClient userServiceClient;
    private final LeaveServiceClient leaveServiceClient;
    private final PerformanceServiceClient performanceServiceClient;

    @GetMapping("/hr-dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<HrDashboardDto>> getHrDashboard() {
        Map<String, Object> userStats = fetchSafely("user-service", () -> userServiceClient.getUserStats());
        Map<String, Object> leaveStats = fetchSafely("leave-service", () -> leaveServiceClient.getLeaveStats());
        Map<String, Object> perfStats = fetchSafely("performance-service", () -> performanceServiceClient.getPerformanceStats());

        HrDashboardDto dashboard = HrDashboardDto.builder()
                .totalEmployees(toLong(userStats.get("totalUsers")))
                .activeEmployees(toLong(userStats.get("activeUsers")))
                .newJoineesThisMonth(toLong(userStats.get("newThisMonth")))
                .onLeaveToday(toLong(leaveStats.get("onLeaveToday")))
                .pendingLeaveRequests(toLong(leaveStats.get("pendingRequests")))
                .openGoals(toLong(perfStats.get("openGoals")))
                .completedGoalsThisMonth(toLong(perfStats.get("completedGoals")))
                .averagePerformanceRating(toDouble(perfStats.get("averagePerformanceRating")))
                .departmentWiseHeadcount(toList(userStats.get("byRole")))
                .leaveUtilizationByType(toList(leaveStats.get("utilizationByType")))
                .build();

        return ResponseEntity.ok(ApiResponse.success("HR Dashboard", dashboard));
    }

    @GetMapping("/headcount")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHeadcount() {
        Map<String, Object> userStats = fetchSafely("user-service", () -> userServiceClient.getUserStats());
        Map<String, Object> data = new HashMap<>();
        data.put("total", userStats.get("totalUsers"));
        data.put("active", userStats.get("activeUsers"));
        data.put("byRole", userStats.get("byRole"));
        data.put("newThisMonth", userStats.get("newThisMonth"));
        return ResponseEntity.ok(ApiResponse.success("Headcount", data));
    }

    @GetMapping("/leave-utilization")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getLeaveUtilization() {
        Map<String, Object> leaveStats = fetchSafely("leave-service", () -> leaveServiceClient.getLeaveStats());
        return ResponseEntity.ok(ApiResponse.success("Leave utilization", leaveStats));
    }

    @GetMapping("/performance-summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPerformanceSummary() {
        Map<String, Object> perfStats = fetchSafely("performance-service", () -> performanceServiceClient.getPerformanceStats());
        return ResponseEntity.ok(ApiResponse.success("Performance summary", perfStats));
    }

    @GetMapping("/goal-completion")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getGoalCompletion() {
        Map<String, Object> perfStats = fetchSafely("performance-service", () -> performanceServiceClient.getPerformanceStats());
        Map<String, Object> data = new HashMap<>();
        long total = toLong(perfStats.get("openGoals")) + toLong(perfStats.get("completedGoals"));
        long completed = toLong(perfStats.get("completedGoals"));
        data.put("totalGoals", total);
        data.put("completedGoals", completed);
        data.put("openGoals", perfStats.get("openGoals"));
        data.put("completionRate", total > 0 ? Math.round((completed * 100.0 / total) * 10.0) / 10.0 : 0.0);
        return ResponseEntity.ok(ApiResponse.success("Goal completion", data));
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> fetchSafely(String serviceName, java.util.function.Supplier<ApiResponse<Map<String, Object>>> supplier) {
        try {
            ApiResponse<Map<String, Object>> response = supplier.get();
            if (response != null && response.getData() != null) {
                return response.getData();
            }
        } catch (Exception e) {
            log.warn("Failed to fetch stats from {}: {}", serviceName, e.getMessage());
        }
        return new HashMap<>();
    }

    private long toLong(Object value) {
        if (value == null) return 0L;
        if (value instanceof Number) return ((Number) value).longValue();
        try { return Long.parseLong(value.toString()); } catch (Exception e) { return 0L; }
    }

    private double toDouble(Object value) {
        if (value == null) return 0.0;
        if (value instanceof Number) return ((Number) value).doubleValue();
        try { return Double.parseDouble(value.toString()); } catch (Exception e) { return 0.0; }
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> toList(Object value) {
        if (value instanceof List) return (List<Map<String, Object>>) value;
        return new ArrayList<>();
    }
}
