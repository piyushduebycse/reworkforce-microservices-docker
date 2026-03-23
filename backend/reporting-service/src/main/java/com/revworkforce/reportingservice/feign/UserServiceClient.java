package com.revworkforce.reportingservice.feign;

import com.revworkforce.reportingservice.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Map;

@FeignClient(name = "user-service")
public interface UserServiceClient {
    @GetMapping("/api/internal/users/stats")
    ApiResponse<Map<String, Object>> getUserStats();
}
