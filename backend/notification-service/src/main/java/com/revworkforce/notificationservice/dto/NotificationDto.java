package com.revworkforce.notificationservice.dto;

import com.revworkforce.notificationservice.entity.NotificationType;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class NotificationDto {
    private Long id;
    private Long recipientUserId;
    private String title;
    private String message;
    private NotificationType type;
    private Long referenceId;
    private String referenceType;
    private boolean isRead;
    private LocalDateTime createdAt;
}
