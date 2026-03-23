package com.revworkforce.leaveservice.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class NotificationRequest {
    private Long recipientUserId;
    private String title;
    private String message;
    private String type;
    private Long referenceId;
    private String referenceType;
}
