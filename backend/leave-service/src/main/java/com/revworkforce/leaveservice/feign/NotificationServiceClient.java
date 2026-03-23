package com.revworkforce.leaveservice.feign;

import com.revworkforce.leaveservice.dto.ApiResponse;
import com.revworkforce.leaveservice.dto.NotificationRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "notification-service")
public interface NotificationServiceClient {
    @PostMapping("/api/internal/notifications")
    ApiResponse<?> sendNotification(@RequestBody NotificationRequest request);
}
