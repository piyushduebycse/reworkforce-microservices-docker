package com.revworkforce.reportingservice.feign;

import com.revworkforce.reportingservice.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@FeignClient(name = "leave-service")
public interface LeaveServiceClient {
    @GetMapping("/api/leaves/reports/summary")
    ApiResponse<Map<String, Object>> getLeaveSummary();
}
