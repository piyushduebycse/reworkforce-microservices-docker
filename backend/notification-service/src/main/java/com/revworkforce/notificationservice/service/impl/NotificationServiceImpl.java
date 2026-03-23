package com.revworkforce.notificationservice.service.impl;

import com.revworkforce.notificationservice.dto.*;
import com.revworkforce.notificationservice.entity.*;
import com.revworkforce.notificationservice.exception.ResourceNotFoundException;
import com.revworkforce.notificationservice.repository.NotificationRepository;
import com.revworkforce.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor @Transactional
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;

    @Override
    public NotificationDto createNotification(NotificationRequest request) {
        NotificationType type;
        try { type = NotificationType.valueOf(request.getType()); } catch (Exception e) { type = NotificationType.GENERAL; }
        Notification n = Notification.builder().recipientUserId(request.getRecipientUserId())
            .title(request.getTitle()).message(request.getMessage()).type(type)
            .referenceId(request.getReferenceId()).referenceType(request.getReferenceType())
            .isRead(false).build();
        return toDto(notificationRepository.save(n));
    }

    @Override @Transactional(readOnly = true)
    public Page<NotificationDto> getMyNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(userId, pageable).map(this::toDto);
    }

    @Override @Transactional(readOnly = true)
    public long countUnread(Long userId) { return notificationRepository.countByRecipientUserIdAndIsReadFalse(userId); }

    @Override
    public NotificationDto markAsRead(Long id, Long userId) {
        Notification n = notificationRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + id));
        n.setRead(true);
        return toDto(notificationRepository.save(n));
    }

    @Override
    public void markAllAsRead(Long userId) {
        notificationRepository.findByRecipientUserIdAndIsReadFalse(userId).forEach(n -> { n.setRead(true); notificationRepository.save(n); });
    }

    @Override
    public void deleteNotification(Long id, Long userId) {
        Notification n = notificationRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + id));
        notificationRepository.delete(n);
    }

    private NotificationDto toDto(Notification n) {
        return NotificationDto.builder().id(n.getId()).recipientUserId(n.getRecipientUserId())
            .title(n.getTitle()).message(n.getMessage()).type(n.getType())
            .referenceId(n.getReferenceId()).referenceType(n.getReferenceType())
            .isRead(n.isRead()).createdAt(n.getCreatedAt()).build();
    }
}
