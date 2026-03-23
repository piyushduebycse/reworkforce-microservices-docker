package com.revworkforce.performanceservice.repository;

import com.revworkforce.performanceservice.entity.PerformanceReview;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PerformanceReviewRepository extends JpaRepository<PerformanceReview, Long> {
    List<PerformanceReview> findByEmployeeIdOrderBySubmittedAtDesc(Long employeeId);
    List<PerformanceReview> findByManagerIdOrderBySubmittedAtDesc(Long managerId);
    List<PerformanceReview> findByReviewCycleId(Long cycleId);

    @org.springframework.data.jpa.repository.Query(
        "SELECT AVG(r.managerRating) FROM PerformanceReview r WHERE r.managerRating IS NOT NULL")
    Double getAverageManagerRating();

    @org.springframework.data.jpa.repository.Query(
        "SELECT COUNT(r) FROM PerformanceReview r WHERE r.reviewedAt >= :start")
    long countReviewedAfter(@org.springframework.data.repository.query.Param("start") java.time.LocalDateTime start);
}
