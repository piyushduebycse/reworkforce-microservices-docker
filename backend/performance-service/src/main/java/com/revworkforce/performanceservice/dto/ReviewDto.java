package com.revworkforce.performanceservice.dto;

import com.revworkforce.performanceservice.entity.ReviewStatus;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ReviewDto {
    private Long id;
    private Long employeeId;
    private Long managerId;
    private Long reviewCycleId;
    private Integer selfRating;
    private Integer managerRating;
    private String selfComments;
    private String managerFeedback;
    private ReviewStatus status;
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
}
