package com.revworkforce.employeemanagement.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AnnouncementDto {
    private Long id;
    private String title;
    private String content;
    private Long postedById;
    private String targetRole;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
}
