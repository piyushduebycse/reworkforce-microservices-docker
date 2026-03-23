package com.revworkforce.performanceservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name = "goals")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Goal {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private Long employeeId;
    private Long managerId;
    @Column(nullable = false) private String title;
    @Column(length = 2000) private String description;
    private LocalDate targetDate;
    @Enumerated(EnumType.STRING) @Builder.Default private GoalStatus status = GoalStatus.PENDING;
    @Builder.Default private int progress = 0;
    private Long reviewCycleId;
    @CreationTimestamp private LocalDateTime createdAt;
    @UpdateTimestamp private LocalDateTime updatedAt;
}
