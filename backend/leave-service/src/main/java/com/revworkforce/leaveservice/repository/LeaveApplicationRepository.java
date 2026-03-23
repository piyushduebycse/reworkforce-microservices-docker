package com.revworkforce.leaveservice.repository;

import com.revworkforce.leaveservice.entity.LeaveApplication;
import com.revworkforce.leaveservice.entity.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;

public interface LeaveApplicationRepository extends JpaRepository<LeaveApplication, Long> {
    List<LeaveApplication> findByUserIdOrderByAppliedAtDesc(Long userId);
    List<LeaveApplication> findByManagerIdOrderByAppliedAtDesc(Long managerId);
    List<LeaveApplication> findByManagerIdAndStatusOrderByAppliedAtDesc(Long managerId, LeaveStatus status);

    @Query("SELECT la FROM LeaveApplication la WHERE la.userId IN :userIds ORDER BY la.appliedAt DESC")
    List<LeaveApplication> findByUserIds(List<Long> userIds);

    @Query("SELECT la FROM LeaveApplication la WHERE la.userId = :userId AND la.status IN ('PENDING', 'APPROVED') " +
           "AND la.startDate <= :endDate AND la.endDate >= :startDate")
    List<LeaveApplication> findOverlappingLeaves(Long userId, LocalDate startDate, LocalDate endDate);

    long countByManagerIdAndStatus(Long managerId, LeaveStatus status);

    @Query("SELECT COUNT(la) FROM LeaveApplication la WHERE la.status = 'APPROVED' AND la.startDate <= :today AND la.endDate >= :today")
    long countEmployeesOnLeaveToday(LocalDate today);
}
