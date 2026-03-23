package com.revworkforce.performanceservice.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
public class ReviewRequest {
    @NotNull @Min(1) @Max(5) private Integer selfRating;
    private String selfComments;
    private Long reviewCycleId;
}
