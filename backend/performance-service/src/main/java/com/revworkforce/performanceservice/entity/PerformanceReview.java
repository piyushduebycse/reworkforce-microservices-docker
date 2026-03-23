package com.revworkforce.performanceservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity @Table(name = "performance_reviews")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PerformanceReview {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private Long employeeId;
    private Long managerId;
    private Long reviewCycleId;
    private Integer selfRating;
    private Integer managerRating;
    @Column(length = 2000) private String selfComments;
    @Column(length = 2000) private String managerFeedback;
    @Enumerated(EnumType.STRING) @Builder.Default private ReviewStatus status = ReviewStatus.DRAFT;
    @CreationTimestamp private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
}
