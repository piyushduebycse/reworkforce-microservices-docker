package com.revworkforce.leaveservice.feign;

import com.revworkforce.leaveservice.dto.ApiResponse;
import com.revworkforce.leaveservice.dto.UserDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "user-service")
public interface UserServiceClient {
    @GetMapping("/api/internal/users/{id}")
    ApiResponse<UserDto> getUserById(@PathVariable Long id);

    @GetMapping("/api/internal/users/batch")
    ApiResponse<List<UserDto>> getUsersByIds(@RequestParam List<Long> ids);
}
