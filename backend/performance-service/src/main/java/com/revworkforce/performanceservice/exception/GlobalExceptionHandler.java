package com.revworkforce.performanceservice.exception;

import com.revworkforce.performanceservice.dto.ApiResponse;
import org.springframework.http.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> notFound(ResourceNotFoundException ex) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(ex.getMessage(), 404)); }
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<?>> business(BusinessException ex) { return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(ex.getMessage(), 400)); }
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<?>> access(AccessDeniedException ex) { return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied", 403)); }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> general(Exception ex) { return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("Error: " + ex.getMessage(), 500)); }
}
