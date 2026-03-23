package com.revworkforce.performanceservice.dto;

import com.revworkforce.performanceservice.entity.GoalStatus;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class GoalDto {
    private Long id;
    private Long employeeId;
    private Long managerId;
    private String title;
    private String description;
    private LocalDate targetDate;
    private GoalStatus status;
    private int progress;
    private Long reviewCycleId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
