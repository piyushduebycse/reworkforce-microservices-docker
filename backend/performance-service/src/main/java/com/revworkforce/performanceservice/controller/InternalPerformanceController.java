package com.revworkforce.performanceservice.controller;

import com.revworkforce.performanceservice.dto.ApiResponse;
import com.revworkforce.performanceservice.entity.GoalStatus;
import com.revworkforce.performanceservice.repository.GoalRepository;
import com.revworkforce.performanceservice.repository.PerformanceReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/internal/performance")
@RequiredArgsConstructor
public class InternalPerformanceController {

    private final PerformanceReviewRepository reviewRepository;
    private final GoalRepository goalRepository;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        Map<String, Object> stats = new HashMap<>();

        Double avgRating = reviewRepository.getAverageManagerRating();
        stats.put("averagePerformanceRating", avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0);
        stats.put("totalReviews", reviewRepository.count());

        long openGoals = goalRepository.countByStatus(GoalStatus.IN_PROGRESS)
                       + goalRepository.countByStatus(GoalStatus.PENDING);
        stats.put("openGoals", openGoals);
        stats.put("completedGoals", goalRepository.countByStatus(GoalStatus.COMPLETED));

        java.time.LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        stats.put("reviewedThisMonth", reviewRepository.countReviewedAfter(startOfMonth));

        return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                .success(true).message("Performance stats").data(stats).statusCode(200).build());
    }
}
