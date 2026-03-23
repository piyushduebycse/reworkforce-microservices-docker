package com.revworkforce.leaveservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "company_holidays")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CompanyHoliday {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false)
    private LocalDate date;
    private String description;
    private boolean isRecurring;
}
