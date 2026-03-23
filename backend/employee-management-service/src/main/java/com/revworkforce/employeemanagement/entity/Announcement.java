package com.revworkforce.employeemanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity @Table(name = "announcements") @Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Announcement {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String title;
    @Column(length = 5000) private String content;
    private Long postedById;
    private String targetRole;
    @Builder.Default private boolean isActive = true;
    @CreationTimestamp private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
}
