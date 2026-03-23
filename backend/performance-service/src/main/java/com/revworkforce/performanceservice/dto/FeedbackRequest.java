package com.revworkforce.performanceservice.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
public class FeedbackRequest {
    @NotNull @Min(1) @Max(5) private Integer managerRating;
    private String managerFeedback;
}
