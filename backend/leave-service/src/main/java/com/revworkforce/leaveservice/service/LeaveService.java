package com.revworkforce.leaveservice.service;

import com.revworkforce.leaveservice.dto.*;
import com.revworkforce.leaveservice.entity.LeaveApplication;
import com.revworkforce.leaveservice.entity.LeaveType;

import java.util.List;

public interface LeaveService {
    List<LeaveTypeDto> getAllLeaveTypes();
    LeaveTypeDto createLeaveType(LeaveTypeDto dto);
    LeaveTypeDto updateLeaveType(Long id, LeaveTypeDto dto);
    void deleteLeaveType(Long id);

    List<LeaveBalanceDto> getMyBalances(Long userId, int year);
    List<LeaveBalanceDto> getUserBalances(Long userId, int year);
    LeaveBalanceDto setLeaveBalance(Long userId, Long leaveTypeId, int totalDays, int year);
    int initializeBalances(List<Long> userIds, List<com.revworkforce.leaveservice.dto.LeaveBalanceSetRequest.TypeDefault> defaults, int year);
    int initUserBalancesFromQuota(Long userId, String role, int year);
    List<com.revworkforce.leaveservice.dto.LeaveQuotaDto> getQuotas(int year);
    com.revworkforce.leaveservice.dto.LeaveQuotaDto upsertQuota(com.revworkforce.leaveservice.dto.LeaveQuotaDto dto);
    void deleteQuota(Long id);

    LeaveApplicationDto applyLeave(Long userId, Long managerId, LeaveApplicationRequest request);
    List<LeaveApplicationDto> getMyApplications(Long userId);
    List<LeaveApplicationDto> getTeamApplications(Long managerId);
    List<LeaveApplicationDto> getPendingApprovals(Long managerId);
    LeaveApplicationDto getApplicationById(Long id);
    LeaveApplicationDto approveLeave(Long id, Long managerId, LeaveActionRequest request);
    LeaveApplicationDto rejectLeave(Long id, Long managerId, LeaveActionRequest request);
    LeaveApplicationDto cancelLeave(Long id, Long userId);

    long countPendingApprovalsForManager(Long managerId);
    long countEmployeesOnLeaveToday();

    List<CompanyHolidayDto> getAllHolidays();
    List<CompanyHolidayDto> getUpcomingHolidays();
    CompanyHolidayDto createHoliday(CompanyHolidayDto dto);
    CompanyHolidayDto updateHoliday(Long id, CompanyHolidayDto dto);
    void deleteHoliday(Long id);
}
