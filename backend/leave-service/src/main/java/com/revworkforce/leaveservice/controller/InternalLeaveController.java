package com.revworkforce.leaveservice.controller;

import com.revworkforce.leaveservice.dto.ApiResponse;
import com.revworkforce.leaveservice.entity.LeaveStatus;
import com.revworkforce.leaveservice.entity.LeaveType;
import com.revworkforce.leaveservice.repository.LeaveApplicationRepository;
import com.revworkforce.leaveservice.repository.LeaveBalanceRepository;
import com.revworkforce.leaveservice.repository.LeaveTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/internal/leaves")
@RequiredArgsConstructor
public class InternalLeaveController {

    private final LeaveApplicationRepository leaveApplicationRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveTypeRepository leaveTypeRepository;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("onLeaveToday", leaveApplicationRepository.countEmployeesOnLeaveToday(LocalDate.now()));
        stats.put("pendingRequests", leaveApplicationRepository.countByStatus(LeaveStatus.PENDING));

        int year = LocalDate.now().getYear();
        List<Map<String, Object>> utilization = new ArrayList<>();
        Map<Long, String> typeNames = new HashMap<>();
        leaveTypeRepository.findAll().forEach(lt -> typeNames.put(lt.getId(), lt.getName()));

        for (Object[] row : leaveBalanceRepository.getUtilizationByTypeAndYear(year)) {
            Long typeId = (Long) row[0];
            long used = row[1] != null ? ((Number) row[1]).longValue() : 0L;
            long total = row[2] != null ? ((Number) row[2]).longValue() : 0L;
            Map<String, Object> entry = new HashMap<>();
            entry.put("leaveTypeId", typeId);
            entry.put("leaveTypeName", typeNames.getOrDefault(typeId, "Unknown"));
            entry.put("usedDays", used);
            entry.put("totalDays", total);
            utilization.add(entry);
        }
        stats.put("utilizationByType", utilization);

        return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                .success(true).message("Leave stats").data(stats).statusCode(200).build());
    }
}
