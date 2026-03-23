package com.revworkforce.reportingservice.feign;

import com.revworkforce.reportingservice.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Map;

@FeignClient(name = "performance-service")
public interface PerformanceServiceClient {
    @GetMapping("/api/internal/performance/stats")
    ApiResponse<Map<String, Object>> getPerformanceStats();
}
