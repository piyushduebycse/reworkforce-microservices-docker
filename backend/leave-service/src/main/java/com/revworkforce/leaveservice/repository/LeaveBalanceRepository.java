package com.revworkforce.leaveservice.repository;

import com.revworkforce.leaveservice.entity.LeaveBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {
    List<LeaveBalance> findByUserIdAndYear(Long userId, int year);
    Optional<LeaveBalance> findByUserIdAndLeaveTypeIdAndYear(Long userId, Long leaveTypeId, int year);
    List<LeaveBalance> findByUserId(Long userId);
}
