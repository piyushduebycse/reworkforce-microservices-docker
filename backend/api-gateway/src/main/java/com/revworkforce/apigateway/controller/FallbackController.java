package com.revworkforce.apigateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @GetMapping("/user-service")
    public ResponseEntity<Map<String, Object>> userServiceFallback() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(
                buildFallbackResponse("User Service is temporarily unavailable. Please try again later.")
        );
    }

    @GetMapping("/leave-service")
    public ResponseEntity<Map<String, Object>> leaveServiceFallback() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(
                buildFallbackResponse("Leave Service is temporarily unavailable. Please try again later.")
        );
    }

    @GetMapping("/performance-service")
    public ResponseEntity<Map<String, Object>> performanceServiceFallback() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(
                buildFallbackResponse("Performance Service is temporarily unavailable. Please try again later.")
        );
    }

    @GetMapping("/employee-management-service")
    public ResponseEntity<Map<String, Object>> employeeManagementServiceFallback() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(
                buildFallbackResponse("Employee Management Service is temporarily unavailable. Please try again later.")
        );
    }

    @GetMapping("/reporting-service")
    public ResponseEntity<Map<String, Object>> reportingServiceFallback() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(
                buildFallbackResponse("Reporting Service is temporarily unavailable. Please try again later.")
        );
    }

    @GetMapping("/notification-service")
    public ResponseEntity<Map<String, Object>> notificationServiceFallback() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(
                buildFallbackResponse("Notification Service is temporarily unavailable. Please try again later.")
        );
    }

    private Map<String, Object> buildFallbackResponse(String message) {
        return Map.of(
                "success", false,
                "message", message,
                "data", null,
                "timestamp", LocalDateTime.now().toString(),
                "statusCode", 503
        );
    }
}
