package com.revworkforce.performanceservice.controller;

import com.revworkforce.performanceservice.dto.*;
import com.revworkforce.performanceservice.security.JwtTokenProvider;
import com.revworkforce.performanceservice.service.PerformanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController @RequestMapping("/api/performance") @RequiredArgsConstructor
public class PerformanceController {
    private final PerformanceService performanceService;
    private final JwtTokenProvider jwtTokenProvider;

    private Long getUserId(String auth) { return jwtTokenProvider.getUserIdFromToken(auth.substring(7)); }

    @GetMapping("/cycles")
    public ResponseEntity<ApiResponse<List<ReviewDto>>> getCycles() { return ResponseEntity.ok(ApiResponse.success("Cycles", performanceService.getActiveCycles())); }

    @PostMapping("/cycles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ReviewDto>> createCycle(@RequestBody Map<String, String> body) {
        return ResponseEntity.status(201).body(ApiResponse.<ReviewDto>builder().success(true).message("Created").statusCode(201).data(performanceService.createCycle(body.get("name"), body.get("startDate"), body.get("endDate"))).build());
    }

    @PostMapping("/reviews")
    public ResponseEntity<ApiResponse<ReviewDto>> createReview(@RequestHeader("Authorization") String auth, @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.status(201).body(ApiResponse.<ReviewDto>builder().success(true).message("Review created").statusCode(201).data(performanceService.createReview(getUserId(auth), request)).build());
    }

    @GetMapping("/reviews/me")
    public ResponseEntity<ApiResponse<List<ReviewDto>>> getMyReviews(@RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(ApiResponse.success("Reviews", performanceService.getMyReviews(getUserId(auth))));
    }

    @GetMapping("/reviews/team")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<ReviewDto>>> getTeamReviews(@RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(ApiResponse.success("Team reviews", performanceService.getTeamReviews(getUserId(auth))));
    }

    @GetMapping("/reviews/{id}")
    public ResponseEntity<ApiResponse<ReviewDto>> getReview(@PathVariable Long id) { return ResponseEntity.ok(ApiResponse.success("Review", performanceService.getReviewById(id))); }

    @PutMapping("/reviews/{id}/submit")
    public ResponseEntity<ApiResponse<ReviewDto>> submitReview(@PathVariable Long id, @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(ApiResponse.success("Submitted", performanceService.submitReview(id, getUserId(auth))));
    }

    @PutMapping("/reviews/{id}/provide-feedback")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ReviewDto>> provideFeedback(@PathVariable Long id, @RequestHeader("Authorization") String auth, @Valid @RequestBody FeedbackRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Feedback provided", performanceService.provideFeedback(id, getUserId(auth), request)));
    }

    @PostMapping("/goals")
    public ResponseEntity<ApiResponse<GoalDto>> createGoal(@RequestHeader("Authorization") String auth, @Valid @RequestBody GoalRequest request) {
        return ResponseEntity.status(201).body(ApiResponse.<GoalDto>builder().success(true).message("Goal created").statusCode(201).data(performanceService.createGoal(getUserId(auth), null, request)).build());
    }

    @GetMapping("/goals/me")
    public ResponseEntity<ApiResponse<List<GoalDto>>> getMyGoals(@RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(ApiResponse.success("Goals", performanceService.getMyGoals(getUserId(auth))));
    }

    @GetMapping("/goals/team")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<GoalDto>>> getTeamGoals(@RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(ApiResponse.success("Team goals", performanceService.getTeamGoals(getUserId(auth))));
    }

    @GetMapping("/goals/{id}")
    public ResponseEntity<ApiResponse<GoalDto>> getGoal(@PathVariable Long id) { return ResponseEntity.ok(ApiResponse.success("Goal", performanceService.getGoalById(id))); }

    @PutMapping("/goals/{id}")
    public ResponseEntity<ApiResponse<GoalDto>> updateGoal(@PathVariable Long id, @RequestBody GoalRequest req) { return ResponseEntity.ok(ApiResponse.success("Updated", performanceService.updateGoal(id, req))); }

    @PutMapping("/goals/{id}/progress")
    public ResponseEntity<ApiResponse<GoalDto>> updateProgress(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        return ResponseEntity.ok(ApiResponse.success("Progress updated", performanceService.updateGoalProgress(id, body.get("progress"))));
    }

    @PutMapping("/goals/{id}/status")
    public ResponseEntity<ApiResponse<GoalDto>> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success("Status updated", performanceService.updateGoalStatus(id, body.get("status"))));
    }

    @DeleteMapping("/goals/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGoal(@PathVariable Long id) { performanceService.deleteGoal(id); return ResponseEntity.ok(ApiResponse.success("Cancelled", null)); }
}
