package com.revworkforce.leaveservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leave_applications")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LeaveApplication {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private Long userId;
    private Long managerId;
    @Column(nullable = false)
    private Long leaveTypeId;
    @Column(nullable = false)
    private LocalDate startDate;
    @Column(nullable = false)
    private LocalDate endDate;
    private int numberOfDays;
    @Column(length = 1000)
    private String reason;
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private LeaveStatus status = LeaveStatus.PENDING;
    private String managerComment;
    @CreationTimestamp
    private LocalDateTime appliedAt;
    private LocalDateTime reviewedAt;
}
