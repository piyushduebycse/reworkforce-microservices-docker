package com.revworkforce.performanceservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDate;

@Data
public class GoalRequest {
    @NotBlank private String title;
    private String description;
    private LocalDate targetDate;
    private Long reviewCycleId;
}
