package com.revworkforce.leaveservice.service.impl;

import com.revworkforce.leaveservice.dto.*;
import com.revworkforce.leaveservice.entity.*;
import com.revworkforce.leaveservice.exception.BusinessException;
import com.revworkforce.leaveservice.exception.ResourceNotFoundException;
import com.revworkforce.leaveservice.feign.NotificationServiceClient;
import com.revworkforce.leaveservice.feign.UserServiceClient;
import com.revworkforce.leaveservice.repository.*;
import com.revworkforce.leaveservice.service.LeaveService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class LeaveServiceImpl implements LeaveService {

    private final LeaveApplicationRepository leaveApplicationRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final CompanyHolidayRepository companyHolidayRepository;
    private final LeaveQuotaRepository leaveQuotaRepository;
    private final UserServiceClient userServiceClient;
    private final NotificationServiceClient notificationServiceClient;

    @Override
    @Transactional(readOnly = true)
    public List<LeaveTypeDto> getAllLeaveTypes() {
        return leaveTypeRepository.findByIsActiveTrue().stream().map(this::toLeaveTypeDto).collect(Collectors.toList());
    }

    @Override
    public LeaveTypeDto createLeaveType(LeaveTypeDto dto) {
        LeaveType lt = LeaveType.builder().name(dto.getName()).description(dto.getDescription())
                .isPaid(dto.isPaid()).isActive(true).build();
        return toLeaveTypeDto(leaveTypeRepository.save(lt));
    }

    @Override
    public LeaveTypeDto updateLeaveType(Long id, LeaveTypeDto dto) {
        LeaveType lt = leaveTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave type not found: " + id));
        if (dto.getName() != null) lt.setName(dto.getName());
        if (dto.getDescription() != null) lt.setDescription(dto.getDescription());
        lt.setPaid(dto.isPaid());
        return toLeaveTypeDto(leaveTypeRepository.save(lt));
    }

    @Override
    public void deleteLeaveType(Long id) {
        LeaveType lt = leaveTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave type not found: " + id));
        lt.setActive(false);
        leaveTypeRepository.save(lt);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveBalanceDto> getMyBalances(Long userId, int year) {
        List<LeaveBalance> balances = leaveBalanceRepository.findByUserIdAndYear(userId, year);
        return balances.stream().map(b -> {
            LeaveType lt = leaveTypeRepository.findById(b.getLeaveTypeId()).orElse(null);
            return LeaveBalanceDto.builder()
                    .id(b.getId()).userId(b.getUserId()).leaveTypeId(b.getLeaveTypeId())
                    .leaveTypeName(lt != null ? lt.getName() : "Unknown")
                    .totalDays(b.getTotalDays()).usedDays(b.getUsedDays())
                    .remainingDays(b.getRemainingDays()).year(b.getYear()).build();
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveBalanceDto> getUserBalances(Long userId, int year) {
        return getMyBalances(userId, year);
    }

    @Override
    public LeaveApplicationDto applyLeave(Long userId, Long managerId, LeaveApplicationRequest request) {
        // Resolve manager ID from user-service if not provided
        Long resolvedManagerId = managerId;
        if (resolvedManagerId == null) {
            try {
                ApiResponse<UserDto> userResponse = userServiceClient.getUserById(userId);
                if (userResponse != null && userResponse.getData() != null) {
                    resolvedManagerId = userResponse.getData().getManagerId();
                }
            } catch (Exception e) {
                log.warn("Could not fetch manager ID for user {}: {}", userId, e.getMessage());
            }
        }

        // Validation
        if (request.getStartDate().isBefore(LocalDate.now())) {
            throw new BusinessException("Cannot apply for leave with past start date");
        }
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BusinessException("End date cannot be before start date");
        }

        // Check overlapping
        List<LeaveApplication> overlapping = leaveApplicationRepository
                .findOverlappingLeaves(userId, request.getStartDate(), request.getEndDate());
        if (!overlapping.isEmpty()) {
            throw new BusinessException("You already have a leave application overlapping these dates");
        }

        // Calculate working days
        int numberOfDays = calculateWorkingDays(request.getStartDate(), request.getEndDate());

        // Check balance
        int year = request.getStartDate().getYear();
        LeaveBalance balance = leaveBalanceRepository
                .findByUserIdAndLeaveTypeIdAndYear(userId, request.getLeaveTypeId(), year)
                .orElseThrow(() -> new BusinessException("No leave balance found for this leave type"));

        if (balance.getRemainingDays() < numberOfDays) {
            throw new BusinessException("Insufficient leave balance. Available: " + balance.getRemainingDays() + " days");
        }

        LeaveApplication application = LeaveApplication.builder()
                .userId(userId).managerId(resolvedManagerId).leaveTypeId(request.getLeaveTypeId())
                .startDate(request.getStartDate()).endDate(request.getEndDate())
                .numberOfDays(numberOfDays).reason(request.getReason())
                .status(LeaveStatus.PENDING).build();
        application = leaveApplicationRepository.save(application);

        // Notify manager
        if (resolvedManagerId != null) {
            try {
                notificationServiceClient.sendNotification(NotificationRequest.builder()
                        .recipientUserId(resolvedManagerId)
                        .title("New Leave Request")
                        .message("An employee has submitted a leave request for " + numberOfDays + " day(s)")
                        .type("LEAVE_APPLIED")
                        .referenceId(application.getId())
                        .referenceType("LEAVE")
                        .build());
            } catch (Exception e) {
                log.warn("Failed to send notification: {}", e.getMessage());
            }
        }

        return toDto(application);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveApplicationDto> getMyApplications(Long userId) {
        return leaveApplicationRepository.findByUserIdOrderByAppliedAtDesc(userId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveApplicationDto> getTeamApplications(Long managerId) {
        return leaveApplicationRepository.findByManagerIdOrderByAppliedAtDesc(managerId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveApplicationDto> getPendingApprovals(Long managerId) {
        return leaveApplicationRepository.findByManagerIdAndStatusOrderByAppliedAtDesc(managerId, LeaveStatus.PENDING)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public LeaveApplicationDto getApplicationById(Long id) {
        return toDto(leaveApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave application not found: " + id)));
    }

    @Override
    public LeaveApplicationDto approveLeave(Long id, Long managerId, LeaveActionRequest request) {
        LeaveApplication app = leaveApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave application not found: " + id));
        if (app.getStatus() != LeaveStatus.PENDING) {
            throw new BusinessException("Only pending applications can be approved");
        }

        // Deduct balance
        LeaveBalance balance = leaveBalanceRepository
                .findByUserIdAndLeaveTypeIdAndYear(app.getUserId(), app.getLeaveTypeId(), app.getStartDate().getYear())
                .orElseThrow(() -> new BusinessException("Leave balance not found"));
        balance.setUsedDays(balance.getUsedDays() + app.getNumberOfDays());
        leaveBalanceRepository.save(balance);

        app.setStatus(LeaveStatus.APPROVED);
        app.setManagerId(managerId);
        app.setManagerComment(request != null ? request.getComment() : null);
        app.setReviewedAt(LocalDateTime.now());
        app = leaveApplicationRepository.save(app);

        // Notify employee
        try {
            notificationServiceClient.sendNotification(NotificationRequest.builder()
                    .recipientUserId(app.getUserId())
                    .title("Leave Request Approved")
                    .message("Your leave request from " + app.getStartDate() + " to " + app.getEndDate() + " has been approved.")
                    .type("LEAVE_APPROVED").referenceId(app.getId()).referenceType("LEAVE").build());
        } catch (Exception e) {
            log.warn("Failed to send notification: {}", e.getMessage());
        }

        return toDto(app);
    }

    @Override
    public LeaveApplicationDto rejectLeave(Long id, Long managerId, LeaveActionRequest request) {
        LeaveApplication app = leaveApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave application not found: " + id));
        if (app.getStatus() != LeaveStatus.PENDING) {
            throw new BusinessException("Only pending applications can be rejected");
        }
        app.setStatus(LeaveStatus.REJECTED);
        app.setManagerId(managerId);
        app.setManagerComment(request != null ? request.getComment() : null);
        app.setReviewedAt(LocalDateTime.now());
        app = leaveApplicationRepository.save(app);

        try {
            notificationServiceClient.sendNotification(NotificationRequest.builder()
                    .recipientUserId(app.getUserId())
                    .title("Leave Request Rejected")
                    .message("Your leave request from " + app.getStartDate() + " to " + app.getEndDate() + " has been rejected.")
                    .type("LEAVE_REJECTED").referenceId(app.getId()).referenceType("LEAVE").build());
        } catch (Exception e) {
            log.warn("Failed to send notification: {}", e.getMessage());
        }

        return toDto(app);
    }

    @Override
    public LeaveApplicationDto cancelLeave(Long id, Long userId) {
        LeaveApplication app = leaveApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave application not found: " + id));
        if (!app.getUserId().equals(userId)) {
            throw new BusinessException("You can only cancel your own leave applications");
        }
        if (app.getStatus() == LeaveStatus.CANCELLED) {
            throw new BusinessException("Application already cancelled");
        }
        // Restore balance if was approved
        if (app.getStatus() == LeaveStatus.APPROVED) {
            leaveBalanceRepository.findByUserIdAndLeaveTypeIdAndYear(
                    app.getUserId(), app.getLeaveTypeId(), app.getStartDate().getYear())
                    .ifPresent(b -> {
                        b.setUsedDays(Math.max(0, b.getUsedDays() - app.getNumberOfDays()));
                        leaveBalanceRepository.save(b);
                    });
        }
        app.setStatus(LeaveStatus.CANCELLED);
        return toDto(leaveApplicationRepository.save(app));
    }

    @Override
    @Transactional(readOnly = true)
    public long countPendingApprovalsForManager(Long managerId) {
        return leaveApplicationRepository.countByManagerIdAndStatus(managerId, LeaveStatus.PENDING);
    }

    @Override
    @Transactional(readOnly = true)
    public long countEmployeesOnLeaveToday() {
        return leaveApplicationRepository.countEmployeesOnLeaveToday(LocalDate.now());
    }

    private int calculateWorkingDays(LocalDate start, LocalDate end) {
        List<LocalDate> holidays = companyHolidayRepository
                .findByDateBetweenOrderByDate(start, end).stream()
                .map(CompanyHoliday::getDate).collect(Collectors.toList());
        int days = 0;
        LocalDate current = start;
        while (!current.isAfter(end)) {
            DayOfWeek dow = current.getDayOfWeek();
            if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY && !holidays.contains(current)) {
                days++;
            }
            current = current.plusDays(1);
        }
        return days;
    }

    private LeaveTypeDto toLeaveTypeDto(LeaveType lt) {
        return LeaveTypeDto.builder().id(lt.getId()).name(lt.getName())
                .description(lt.getDescription()).isPaid(lt.isPaid()).isActive(lt.isActive()).build();
    }

    private LeaveApplicationDto toDto(LeaveApplication app) {
        LeaveType lt = leaveTypeRepository.findById(app.getLeaveTypeId()).orElse(null);
        return LeaveApplicationDto.builder()
                .id(app.getId()).userId(app.getUserId()).managerId(app.getManagerId())
                .leaveTypeId(app.getLeaveTypeId()).leaveTypeName(lt != null ? lt.getName() : "Unknown")
                .startDate(app.getStartDate()).endDate(app.getEndDate())
                .numberOfDays(app.getNumberOfDays()).reason(app.getReason())
                .status(app.getStatus()).managerComment(app.getManagerComment())
                .appliedAt(app.getAppliedAt()).reviewedAt(app.getReviewedAt())
                .build();
    }
}
