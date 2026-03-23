package com.revworkforce.employeemanagement.feign;

import com.revworkforce.employeemanagement.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@FeignClient(name = "user-service")
public interface UserServiceClient {
    @GetMapping("/api/internal/users/{id}")
    ApiResponse<Map<String, Object>> getUserById(@PathVariable Long id);
}
