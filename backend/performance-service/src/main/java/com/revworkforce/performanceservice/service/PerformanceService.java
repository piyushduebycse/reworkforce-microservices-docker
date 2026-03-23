package com.revworkforce.performanceservice.service;

import com.revworkforce.performanceservice.dto.*;
import java.util.List;

public interface PerformanceService {
    List<ReviewDto> getActiveCycles();
    ReviewDto createCycle(String name, String start, String end);
    ReviewDto createReview(Long employeeId, ReviewRequest request);
    List<ReviewDto> getMyReviews(Long employeeId);
    List<ReviewDto> getTeamReviews(Long managerId);
    ReviewDto getReviewById(Long id);
    ReviewDto submitReview(Long id, Long employeeId);
    ReviewDto provideFeedback(Long id, Long managerId, FeedbackRequest request);
    GoalDto createGoal(Long employeeId, Long managerId, GoalRequest request);
    List<GoalDto> getMyGoals(Long employeeId);
    List<GoalDto> getTeamGoals(Long managerId);
    GoalDto getGoalById(Long id);
    GoalDto updateGoal(Long id, GoalRequest request);
    GoalDto updateGoalProgress(Long id, int progress);
    GoalDto updateGoalStatus(Long id, String status);
    void deleteGoal(Long id);
    long countOpenGoals();
    long countCompletedGoalsThisMonth();
}
