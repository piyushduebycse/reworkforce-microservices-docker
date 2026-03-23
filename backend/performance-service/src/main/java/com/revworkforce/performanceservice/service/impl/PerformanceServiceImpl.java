package com.revworkforce.performanceservice.service.impl;

import com.revworkforce.performanceservice.dto.*;
import com.revworkforce.performanceservice.entity.*;
import com.revworkforce.performanceservice.exception.*;
import com.revworkforce.performanceservice.repository.*;
import com.revworkforce.performanceservice.service.PerformanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor @Transactional
public class PerformanceServiceImpl implements PerformanceService {

    private final PerformanceReviewRepository reviewRepository;
    private final ReviewCycleRepository cycleRepository;
    private final GoalRepository goalRepository;

    @Override @Transactional(readOnly = true)
    public List<ReviewDto> getActiveCycles() {
        return cycleRepository.findByIsActiveTrueOrderByStartDateDesc().stream()
            .map(c -> ReviewDto.builder().id(c.getId()).selfComments(c.getName()).build()).collect(Collectors.toList());
    }

    @Override
    public ReviewDto createCycle(String name, String start, String end) {
        ReviewCycle cycle = ReviewCycle.builder().name(name)
            .startDate(start != null ? LocalDate.parse(start) : null)
            .endDate(end != null ? LocalDate.parse(end) : null).isActive(true).build();
        cycleRepository.save(cycle);
        return ReviewDto.builder().id(cycle.getId()).selfComments(cycle.getName()).build();
    }

    @Override
    public ReviewDto createReview(Long employeeId, ReviewRequest request) {
        PerformanceReview review = PerformanceReview.builder()
            .employeeId(employeeId).selfRating(request.getSelfRating())
            .selfComments(request.getSelfComments()).reviewCycleId(request.getReviewCycleId())
            .status(ReviewStatus.DRAFT).build();
        return toReviewDto(reviewRepository.save(review));
    }

    @Override @Transactional(readOnly = true)
    public List<ReviewDto> getMyReviews(Long employeeId) {
        return reviewRepository.findByEmployeeIdOrderBySubmittedAtDesc(employeeId).stream().map(this::toReviewDto).collect(Collectors.toList());
    }

    @Override @Transactional(readOnly = true)
    public List<ReviewDto> getTeamReviews(Long managerId) {
        return reviewRepository.findByManagerIdOrderBySubmittedAtDesc(managerId).stream().map(this::toReviewDto).collect(Collectors.toList());
    }

    @Override @Transactional(readOnly = true)
    public ReviewDto getReviewById(Long id) {
        return toReviewDto(reviewRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Review not found: " + id)));
    }

    @Override
    public ReviewDto submitReview(Long id, Long employeeId) {
        PerformanceReview review = reviewRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        if (!review.getEmployeeId().equals(employeeId)) throw new BusinessException("Not your review");
        if (review.getStatus() != ReviewStatus.DRAFT) throw new BusinessException("Only drafts can be submitted");
        review.setStatus(ReviewStatus.SUBMITTED);
        return toReviewDto(reviewRepository.save(review));
    }

    @Override
    public ReviewDto provideFeedback(Long id, Long managerId, FeedbackRequest request) {
        PerformanceReview review = reviewRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        if (review.getStatus() != ReviewStatus.SUBMITTED) throw new BusinessException("Review must be submitted first");
        review.setManagerId(managerId);
        review.setManagerRating(request.getManagerRating());
        review.setManagerFeedback(request.getManagerFeedback());
        review.setStatus(ReviewStatus.REVIEWED);
        review.setReviewedAt(LocalDateTime.now());
        return toReviewDto(reviewRepository.save(review));
    }

    @Override
    public GoalDto createGoal(Long employeeId, Long managerId, GoalRequest request) {
        Goal goal = Goal.builder().employeeId(employeeId).managerId(managerId)
            .title(request.getTitle()).description(request.getDescription())
            .targetDate(request.getTargetDate()).reviewCycleId(request.getReviewCycleId())
            .status(GoalStatus.PENDING).progress(0).build();
        return toGoalDto(goalRepository.save(goal));
    }

    @Override @Transactional(readOnly = true)
    public List<GoalDto> getMyGoals(Long employeeId) {
        return goalRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId).stream().map(this::toGoalDto).collect(Collectors.toList());
    }

    @Override @Transactional(readOnly = true)
    public List<GoalDto> getTeamGoals(Long managerId) {
        return goalRepository.findByManagerIdOrderByCreatedAtDesc(managerId).stream().map(this::toGoalDto).collect(Collectors.toList());
    }

    @Override @Transactional(readOnly = true)
    public GoalDto getGoalById(Long id) {
        return toGoalDto(goalRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Goal not found: " + id)));
    }

    @Override
    public GoalDto updateGoal(Long id, GoalRequest request) {
        Goal goal = goalRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
        if (request.getTitle() != null) goal.setTitle(request.getTitle());
        if (request.getDescription() != null) goal.setDescription(request.getDescription());
        if (request.getTargetDate() != null) goal.setTargetDate(request.getTargetDate());
        return toGoalDto(goalRepository.save(goal));
    }

    @Override
    public GoalDto updateGoalProgress(Long id, int progress) {
        Goal goal = goalRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
        goal.setProgress(Math.min(100, Math.max(0, progress)));
        if (goal.getProgress() == 100) goal.setStatus(GoalStatus.COMPLETED);
        else if (goal.getProgress() > 0) goal.setStatus(GoalStatus.IN_PROGRESS);
        return toGoalDto(goalRepository.save(goal));
    }

    @Override
    public GoalDto updateGoalStatus(Long id, String status) {
        Goal goal = goalRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
        goal.setStatus(GoalStatus.valueOf(status));
        return toGoalDto(goalRepository.save(goal));
    }

    @Override
    public void deleteGoal(Long id) {
        Goal goal = goalRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
        goal.setStatus(GoalStatus.CANCELLED);
        goalRepository.save(goal);
    }

    @Override @Transactional(readOnly = true)
    public long countOpenGoals() { return goalRepository.countByStatus(GoalStatus.IN_PROGRESS) + goalRepository.countByStatus(GoalStatus.PENDING); }

    @Override @Transactional(readOnly = true)
    public long countCompletedGoalsThisMonth() { return goalRepository.countByStatus(GoalStatus.COMPLETED); }

    private ReviewDto toReviewDto(PerformanceReview r) {
        return ReviewDto.builder().id(r.getId()).employeeId(r.getEmployeeId()).managerId(r.getManagerId())
            .reviewCycleId(r.getReviewCycleId()).selfRating(r.getSelfRating()).managerRating(r.getManagerRating())
            .selfComments(r.getSelfComments()).managerFeedback(r.getManagerFeedback()).status(r.getStatus())
            .submittedAt(r.getSubmittedAt()).reviewedAt(r.getReviewedAt()).build();
    }

    private GoalDto toGoalDto(Goal g) {
        return GoalDto.builder().id(g.getId()).employeeId(g.getEmployeeId()).managerId(g.getManagerId())
            .title(g.getTitle()).description(g.getDescription()).targetDate(g.getTargetDate())
            .status(g.getStatus()).progress(g.getProgress()).reviewCycleId(g.getReviewCycleId())
            .createdAt(g.getCreatedAt()).updatedAt(g.getUpdatedAt()).build();
    }
}
