package com.revworkforce.leaveservice.dto;

import lombok.Data;
import java.util.List;

@Data
public class LeaveBalanceSetRequest {
    private List<Long> userIds;
    private List<TypeDefault> defaults;
    private int year;

    @Data
    public static class TypeDefault {
        private Long leaveTypeId;
        private int totalDays;
    }
}
