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
}
