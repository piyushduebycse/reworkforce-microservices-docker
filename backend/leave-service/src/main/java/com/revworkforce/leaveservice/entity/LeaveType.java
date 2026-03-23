package com.revworkforce.leaveservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "leave_types")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LeaveType {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String name;
    private String description;
    private boolean isPaid;
    @Builder.Default
    private boolean isActive = true;
}
