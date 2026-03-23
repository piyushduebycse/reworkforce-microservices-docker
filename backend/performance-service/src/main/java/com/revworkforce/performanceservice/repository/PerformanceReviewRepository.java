package com.revworkforce.performanceservice.repository;

import com.revworkforce.performanceservice.entity.PerformanceReview;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PerformanceReviewRepository extends JpaRepository<PerformanceReview, Long> {
    List<PerformanceReview> findByEmployeeIdOrderBySubmittedAtDesc(Long employeeId);
    List<PerformanceReview> findByManagerIdOrderBySubmittedAtDesc(Long managerId);
    List<PerformanceReview> findByReviewCycleId(Long cycleId);
}
