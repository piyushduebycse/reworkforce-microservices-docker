package com.revworkforce.userservice.controller;

import com.revworkforce.userservice.dto.ApiResponse;
import com.revworkforce.userservice.dto.UserDto;
import com.revworkforce.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/internal/users")
@RequiredArgsConstructor
public class InternalUserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<UserDto>builder()
                .success(true).message("User retrieved").data(userService.getUserByIdInternal(id)).statusCode(200).build());
    }

    @GetMapping("/batch")
    public ResponseEntity<ApiResponse<List<UserDto>>> getUsersByIds(@RequestParam List<Long> ids) {
        return ResponseEntity.ok(ApiResponse.<List<UserDto>>builder()
                .success(true).message("Users retrieved").data(userService.getUsersByIds(ids)).statusCode(200).build());
    }
}
