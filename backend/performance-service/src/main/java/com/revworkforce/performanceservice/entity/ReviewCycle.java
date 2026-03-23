package com.revworkforce.performanceservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity @Table(name = "review_cycles")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ReviewCycle {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    @Builder.Default private boolean isActive = true;
}
