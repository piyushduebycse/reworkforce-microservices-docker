package com.revworkforce.notificationservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity @Table(name = "notifications") @Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private Long recipientUserId;
    @Column(nullable = false) private String title;
    @Column(length = 1000) private String message;
    @Enumerated(EnumType.STRING) @Builder.Default private NotificationType type = NotificationType.GENERAL;
    private Long referenceId;
    private String referenceType;
    @Builder.Default private boolean isRead = false;
    @CreationTimestamp private LocalDateTime createdAt;
}
