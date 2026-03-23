package com.revworkforce.reportingservice.feign;

import com.revworkforce.reportingservice.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@FeignClient(name = "user-service")
public interface UserServiceClient {
    @GetMapping("/api/internal/users/batch")
    ApiResponse<List<Map<String, Object>>> getAllUsers(@RequestParam List<Long> ids);
}
