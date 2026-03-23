package com.revworkforce.notificationservice.service;

import com.revworkforce.notificationservice.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface NotificationService {
    NotificationDto createNotification(NotificationRequest request);
    Page<NotificationDto> getMyNotifications(Long userId, Pageable pageable);
    long countUnread(Long userId);
    NotificationDto markAsRead(Long id, Long userId);
    void markAllAsRead(Long userId);
    void deleteNotification(Long id, Long userId);
}
