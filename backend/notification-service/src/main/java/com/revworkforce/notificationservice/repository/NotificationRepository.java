package com.revworkforce.notificationservice.repository;

import com.revworkforce.notificationservice.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByRecipientUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    List<Notification> findByRecipientUserIdAndIsReadFalse(Long userId);
    long countByRecipientUserIdAndIsReadFalse(Long userId);
}
