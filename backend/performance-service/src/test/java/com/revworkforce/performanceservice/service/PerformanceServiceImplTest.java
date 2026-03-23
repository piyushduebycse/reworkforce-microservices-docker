package com.revworkforce.performanceservice.service;

import com.revworkforce.performanceservice.dto.*;
import com.revworkforce.performanceservice.entity.*;
import com.revworkforce.performanceservice.exception.*;
import com.revworkforce.performanceservice.repository.*;
import com.revworkforce.performanceservice.service.impl.PerformanceServiceImpl;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PerformanceServiceImplTest {
    @Mock private PerformanceReviewRepository reviewRepository;
    @Mock private ReviewCycleRepository cycleRepository;
    @Mock private GoalRepository goalRepository;
    @InjectMocks private PerformanceServiceImpl performanceService;

    @Test
    void createGoal_ValidRequest_ShouldSaveGoal() {
        GoalRequest req = new GoalRequest(); req.setTitle("Improve Skills");
        Goal saved = Goal.builder().id(1L).employeeId(1L).title("Improve Skills").status(GoalStatus.PENDING).progress(0).build();
        when(goalRepository.save(any())).thenReturn(saved);
        var result = performanceService.createGoal(1L, 2L, req);
        assertNotNull(result);
        assertEquals("Improve Skills", result.getTitle());
    }

    @Test
    void submitReview_NotOwner_ShouldThrowBusinessException() {
        PerformanceReview review = PerformanceReview.builder().id(1L).employeeId(1L).status(ReviewStatus.DRAFT).build();
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
        assertThrows(BusinessException.class, () -> performanceService.submitReview(1L, 99L));
    }

    @Test
    void updateGoalProgress_ShouldUpdateStatus() {
        Goal goal = Goal.builder().id(1L).employeeId(1L).title("Test").status(GoalStatus.PENDING).progress(0).build();
        when(goalRepository.findById(1L)).thenReturn(Optional.of(goal));
        when(goalRepository.save(any())).thenReturn(goal);
        var result = performanceService.updateGoalProgress(1L, 100);
        assertEquals(GoalStatus.COMPLETED, goal.getStatus());
    }

    @Test
    void getGoalById_NotFound_ShouldThrow() {
        when(goalRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> performanceService.getGoalById(99L));
    }
}
