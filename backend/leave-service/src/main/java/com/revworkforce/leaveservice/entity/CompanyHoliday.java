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
    @Column(name = "holiday_date", nullable = false)
    private LocalDate date;
    private String description;
    @Column(name = "holiday_type", length = 50)
    private String holidayType; // NATIONAL, REGIONAL, OPTIONAL, COMPANY
    private boolean isRecurring;
}
