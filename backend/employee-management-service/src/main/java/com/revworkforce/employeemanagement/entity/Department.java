package com.revworkforce.employeemanagement.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "departments") @Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Department {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, unique = true) private String name;
    private String description;
    private Long headEmployeeId;
    @Builder.Default private boolean isActive = true;
}
