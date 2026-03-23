package com.revworkforce.leaveservice.repository;

import com.revworkforce.leaveservice.entity.LeaveQuota;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface LeaveQuotaRepository extends JpaRepository<LeaveQuota, Long> {
    List<LeaveQuota> findByYear(int year);
    Optional<LeaveQuota> findByLeaveTypeIdAndRoleAndYear(Long leaveTypeId, String role, int year);
}
