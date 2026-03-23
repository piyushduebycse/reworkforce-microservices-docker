package com.revworkforce.notificationservice.exception;

import com.revworkforce.notificationservice.dto.ApiResponse;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> notFound(ResourceNotFoundException ex) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(ex.getMessage(), 404)); }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> general(Exception ex) { return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("Error: " + ex.getMessage(), 500)); }
}
