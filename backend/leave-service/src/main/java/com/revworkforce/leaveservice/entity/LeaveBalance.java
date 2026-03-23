package com.revworkforce.leaveservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "leave_balances", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"userId", "leaveTypeId", "year"})
})
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LeaveBalance {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private Long userId;
    @Column(nullable = false)
    private Long leaveTypeId;
    private int totalDays;
    @Builder.Default
    private int usedDays = 0;
    private int year;

    public int getRemainingDays() {
        return totalDays - usedDays;
    }
}
