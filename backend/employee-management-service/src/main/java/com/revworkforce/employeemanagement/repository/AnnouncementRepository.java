package com.revworkforce.employeemanagement.repository;

import com.revworkforce.employeemanagement.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    @Query("SELECT a FROM Announcement a WHERE a.isActive = true AND (a.expiresAt IS NULL OR a.expiresAt > :now) AND (a.targetRole = 'ALL' OR a.targetRole = :role) ORDER BY a.createdAt DESC")
    List<Announcement> findActiveAnnouncementsForRole(String role, LocalDateTime now);
}
