package com.revworkforce.apigateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @RequestMapping("/user-service")
    public ResponseEntity<Map<String, Object>> userServiceFallback() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(
                buildFallbackResponse("User Service is temporarily unavailable. Please try again later.")
        );
    }

    @RequestMapping("/leave-service")
    public ResponseEntity<Map<String, Object>> leaveServiceFallback() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(
                buildFallbackResponse("Leave Service is temporarily unavailable. Please try again later.")
        );
    }

    @RequestMapping("/performance-service")
    public ResponseEntity<Map<String, Object>> performanceServiceFallback() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(
                buildFallbackResponse("Performance Service is temporarily unavailable. Please try again later.")
        );
    }

    @RequestMapping("/employee-management-service")
    public ResponseEntity<Map<String, Object>> employeeManagementServiceFallback() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(
                buildFallbackResponse("Employee Management Service is temporarily unavailable. Please try again later.")
        );
    }

    @RequestMapping("/reporting-service")
    public ResponseEntity<Map<String, Object>> reportingServiceFallback() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(
                buildFallbackResponse("Reporting Service is temporarily unavailable. Please try again later.")
        );
    }

    @RequestMapping("/notification-service")
    public ResponseEntity<Map<String, Object>> notificationServiceFallback() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(
                buildFallbackResponse("Notification Service is temporarily unavailable. Please try again later.")
        );
    }

    private Map<String, Object> buildFallbackResponse(String message) {
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("success", false);
        response.put("message", message);
        response.put("data", null);
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("statusCode", 503);
        return response;
    }
}
