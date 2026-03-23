package com.revworkforce.leaveservice.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class LeaveApplicationRequest {
    @NotNull private Long leaveTypeId;
    @NotNull private LocalDate startDate;
    @NotNull private LocalDate endDate;
    private String reason;
}
