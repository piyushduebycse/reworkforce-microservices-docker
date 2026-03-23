package com.revworkforce.leaveservice.service;

import com.revworkforce.leaveservice.dto.LeaveApplicationRequest;
import com.revworkforce.leaveservice.entity.*;
import com.revworkforce.leaveservice.exception.BusinessException;
import com.revworkforce.leaveservice.feign.NotificationServiceClient;
import com.revworkforce.leaveservice.feign.UserServiceClient;
import com.revworkforce.leaveservice.repository.*;
import com.revworkforce.leaveservice.service.impl.LeaveServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LeaveServiceImplTest {

    @Mock private LeaveApplicationRepository leaveApplicationRepository;
    @Mock private LeaveBalanceRepository leaveBalanceRepository;
    @Mock private LeaveTypeRepository leaveTypeRepository;
    @Mock private CompanyHolidayRepository companyHolidayRepository;
    @Mock private LeaveQuotaRepository leaveQuotaRepository;
    @Mock private UserServiceClient userServiceClient;
    @Mock private NotificationServiceClient notificationServiceClient;
    @InjectMocks private LeaveServiceImpl leaveService;

    private LeaveBalance testBalance;
    private LeaveApplicationRequest validRequest;

    @BeforeEach
    void setUp() {
        testBalance = LeaveBalance.builder().id(1L).userId(1L).leaveTypeId(1L).totalDays(18).usedDays(0).year(LocalDate.now().getYear()).build();
        validRequest = new LeaveApplicationRequest();
        validRequest.setLeaveTypeId(1L);
        validRequest.setStartDate(LocalDate.now().plusDays(1));
        validRequest.setEndDate(LocalDate.now().plusDays(3));
        validRequest.setReason("Vacation");
    }

    @Test
    void applyLeave_WithSufficientBalance_ShouldSucceed() {
        when(leaveApplicationRepository.findOverlappingLeaves(anyLong(), any(), any())).thenReturn(Collections.emptyList());
        when(leaveBalanceRepository.findByUserIdAndLeaveTypeIdAndYear(anyLong(), anyLong(), anyInt())).thenReturn(Optional.of(testBalance));
        when(companyHolidayRepository.findByDateBetweenOrderByDate(any(), any())).thenReturn(Collections.emptyList());
        when(leaveTypeRepository.findById(anyLong())).thenReturn(Optional.of(LeaveType.builder().id(1L).name("Annual Leave").build()));
        LeaveApplication savedApp = LeaveApplication.builder().id(1L).userId(1L).leaveTypeId(1L).startDate(validRequest.getStartDate()).endDate(validRequest.getEndDate()).numberOfDays(2).status(LeaveStatus.PENDING).build();
        when(leaveApplicationRepository.save(any())).thenReturn(savedApp);
        when(notificationServiceClient.sendNotification(any())).thenReturn(null);

        var result = leaveService.applyLeave(1L, 2L, validRequest);
        assertNotNull(result);
        assertEquals(LeaveStatus.PENDING, result.getStatus());
    }

    @Test
    void applyLeave_WithInsufficientBalance_ShouldThrowBusinessException() {
        testBalance.setUsedDays(18); // All used
        when(leaveApplicationRepository.findOverlappingLeaves(anyLong(), any(), any())).thenReturn(Collections.emptyList());
        when(leaveBalanceRepository.findByUserIdAndLeaveTypeIdAndYear(anyLong(), anyLong(), anyInt())).thenReturn(Optional.of(testBalance));
        when(companyHolidayRepository.findByDateBetweenOrderByDate(any(), any())).thenReturn(Collections.emptyList());

        assertThrows(BusinessException.class, () -> leaveService.applyLeave(1L, 2L, validRequest));
    }

    @Test
    void applyLeave_PastDate_ShouldThrowBusinessException() {
        validRequest.setStartDate(LocalDate.now().minusDays(1));
        assertThrows(BusinessException.class, () -> leaveService.applyLeave(1L, 2L, validRequest));
    }

    @Test
    void approveLeave_ShouldDeductBalanceAndNotify() {
        LeaveApplication app = LeaveApplication.builder().id(1L).userId(1L).leaveTypeId(1L)
                .startDate(LocalDate.now().plusDays(1)).endDate(LocalDate.now().plusDays(2))
                .numberOfDays(2).status(LeaveStatus.PENDING).build();
        when(leaveApplicationRepository.findById(1L)).thenReturn(Optional.of(app));
        when(leaveBalanceRepository.findByUserIdAndLeaveTypeIdAndYear(anyLong(), anyLong(), anyInt())).thenReturn(Optional.of(testBalance));
        when(leaveApplicationRepository.save(any())).thenReturn(app);
        when(leaveTypeRepository.findById(anyLong())).thenReturn(Optional.of(LeaveType.builder().id(1L).name("Annual Leave").build()));
        when(notificationServiceClient.sendNotification(any())).thenReturn(null);
        when(leaveBalanceRepository.save(any())).thenReturn(testBalance);

        var result = leaveService.approveLeave(1L, 2L, null);
        assertEquals(LeaveStatus.APPROVED, result.getStatus());
        assertEquals(2, testBalance.getUsedDays());
    }
}
