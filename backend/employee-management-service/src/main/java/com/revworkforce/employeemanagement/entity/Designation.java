package com.revworkforce.employeemanagement.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "designations") @Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Designation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String name;
    private String level;
    private Long departmentId;
    @Builder.Default private boolean isActive = true;
}
