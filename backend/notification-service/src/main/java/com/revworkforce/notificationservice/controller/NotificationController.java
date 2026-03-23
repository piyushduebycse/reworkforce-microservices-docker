package com.revworkforce.notificationservice.controller;

import com.revworkforce.notificationservice.dto.*;
import com.revworkforce.notificationservice.security.JwtTokenProvider;
import com.revworkforce.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api") @RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;
    private final JwtTokenProvider jwtTokenProvider;

    private Long getUserId(String auth) { return jwtTokenProvider.getUserIdFromToken(auth.substring(7)); }

    @GetMapping("/notifications/me")
    public ResponseEntity<ApiResponse<Page<NotificationDto>>> getMyNotifications(
            @RequestHeader("Authorization") String auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<NotificationDto> notifications = notificationService.getMyNotifications(getUserId(auth), PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success("Notifications", notifications));
    }

    @GetMapping("/notifications/me/unread")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(@RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(ApiResponse.success("Unread count", notificationService.countUnread(getUserId(auth))));
    }

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<ApiResponse<NotificationDto>> markAsRead(@PathVariable Long id, @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(ApiResponse.success("Marked as read", notificationService.markAsRead(id, getUserId(auth))));
    }

    @PutMapping("/notifications/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(@RequestHeader("Authorization") String auth) {
        notificationService.markAllAsRead(getUserId(auth));
        return ResponseEntity.ok(ApiResponse.success("All marked as read", null));
    }

    @DeleteMapping("/notifications/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id, @RequestHeader("Authorization") String auth) {
        notificationService.deleteNotification(id, getUserId(auth));
        return ResponseEntity.ok(ApiResponse.success("Deleted", null));
    }

    // Internal API - no auth needed (called by other services)
    @PostMapping("/internal/notifications")
    public ResponseEntity<ApiResponse<NotificationDto>> createNotification(@RequestBody NotificationRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Notification created", notificationService.createNotification(request)));
    }
}
