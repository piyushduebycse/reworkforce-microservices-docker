package com.revworkforce.performanceservice.repository;

import com.revworkforce.performanceservice.entity.ReviewCycle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewCycleRepository extends JpaRepository<ReviewCycle, Long> {
    List<ReviewCycle> findByIsActiveTrueOrderByStartDateDesc();
}
