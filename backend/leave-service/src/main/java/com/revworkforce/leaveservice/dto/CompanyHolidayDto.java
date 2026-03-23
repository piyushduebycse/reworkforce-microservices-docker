package com.revworkforce.leaveservice.dto;

import lombok.*;
import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CompanyHolidayDto {
    private Long id;
    private String name;
    private LocalDate date;
    private String description;
    private String holidayType; // NATIONAL, REGIONAL, OPTIONAL, COMPANY
    private boolean isRecurring;
}
