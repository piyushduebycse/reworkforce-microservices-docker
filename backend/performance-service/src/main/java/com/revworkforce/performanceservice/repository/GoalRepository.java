package com.revworkforce.performanceservice.repository;

import com.revworkforce.performanceservice.entity.Goal;
import com.revworkforce.performanceservice.entity.GoalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);
    List<Goal> findByManagerIdOrderByCreatedAtDesc(Long managerId);
    List<Goal> findByStatus(GoalStatus status);
    long countByStatus(GoalStatus status);
}
