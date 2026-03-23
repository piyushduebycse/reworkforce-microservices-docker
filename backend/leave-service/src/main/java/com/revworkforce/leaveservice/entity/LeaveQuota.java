package com.revworkforce.leaveservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "leave_quotas")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LeaveQuota {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private Long leaveTypeId;
    @Column(nullable = false)
    private String role;
    private int totalDays;
    private int year;
}
