package com.revworkforce.reportingservice.exception;

import com.revworkforce.reportingservice.dto.ApiResponse;
import org.springframework.http.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<?>> access(AccessDeniedException ex) { return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied", 403)); }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> general(Exception ex) { return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("Error: " + ex.getMessage(), 500)); }
}
