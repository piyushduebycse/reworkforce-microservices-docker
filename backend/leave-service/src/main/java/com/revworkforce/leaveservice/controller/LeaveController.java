package com.revworkforce.leaveservice.controller;

import com.revworkforce.leaveservice.dto.*;
import com.revworkforce.leaveservice.security.JwtTokenProvider;
import com.revworkforce.leaveservice.service.LeaveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;
    private final JwtTokenProvider jwtTokenProvider;

    private Long getUserId(String auth) {
        return jwtTokenProvider.getUserIdFromToken(auth.substring(7));
    }

    // Leave Types
    @GetMapping("/types")
    public ResponseEntity<ApiResponse<List<LeaveTypeDto>>> getTypes() {
        return ResponseEntity.ok(ApiResponse.success("Leave types", leaveService.getAllLeaveTypes()));
    }

    @PostMapping("/types")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<LeaveTypeDto>> createType(@RequestBody LeaveTypeDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<LeaveTypeDto>builder().success(true).message("Created").data(leaveService.createLeaveType(dto)).statusCode(201).build());
    }

    @PutMapping("/types/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<LeaveTypeDto>> updateType(@PathVariable Long id, @RequestBody LeaveTypeDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Updated", leaveService.updateLeaveType(id, dto)));
    }

    @DeleteMapping("/types/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteType(@PathVariable Long id) {
        leaveService.deleteLeaveType(id);
        return ResponseEntity.ok(ApiResponse.success("Deleted", null));
    }

    // Balances
    @GetMapping("/balances/me")
    public ResponseEntity<ApiResponse<List<LeaveBalanceDto>>> getMyBalances(
            @RequestHeader("Authorization") String auth,
            @RequestParam(defaultValue = "0") int year) {
        int y = year == 0 ? LocalDate.now().getYear() : year;
        return ResponseEntity.ok(ApiResponse.success("Balances", leaveService.getMyBalances(getUserId(auth), y)));
    }

    @GetMapping("/balances/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<LeaveBalanceDto>>> getUserBalances(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int year) {
        int y = year == 0 ? LocalDate.now().getYear() : year;
        return ResponseEntity.ok(ApiResponse.success("Balances", leaveService.getUserBalances(userId, y)));
    }

    // Applications
    @PostMapping("/applications")
    public ResponseEntity<ApiResponse<LeaveApplicationDto>> applyLeave(
            @RequestHeader("Authorization") String auth,
            @Valid @RequestBody LeaveApplicationRequest request) {
        Long userId = getUserId(auth);
        Long managerId = jwtTokenProvider.getUserIdFromToken(auth.substring(7));
        // For now managerId comes from user profile; we get it from JWT or user-service call
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<LeaveApplicationDto>builder().success(true).message("Leave applied").data(leaveService.applyLeave(userId, null, request)).statusCode(201).build());
    }

    @GetMapping("/applications/me")
    public ResponseEntity<ApiResponse<List<LeaveApplicationDto>>> getMyApplications(
            @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(ApiResponse.success("Applications", leaveService.getMyApplications(getUserId(auth))));
    }

    @GetMapping("/applications/team")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<LeaveApplicationDto>>> getTeamApplications(
            @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(ApiResponse.success("Team applications", leaveService.getTeamApplications(getUserId(auth))));
    }

    @GetMapping("/applications/pending")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<LeaveApplicationDto>>> getPendingApprovals(
            @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(ApiResponse.success("Pending", leaveService.getPendingApprovals(getUserId(auth))));
    }

    @GetMapping("/applications/{id}")
    public ResponseEntity<ApiResponse<LeaveApplicationDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Application", leaveService.getApplicationById(id)));
    }

    @PutMapping("/applications/{id}/approve")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<LeaveApplicationDto>> approve(
            @PathVariable Long id,
            @RequestHeader("Authorization") String auth,
            @RequestBody(required = false) LeaveActionRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Approved", leaveService.approveLeave(id, getUserId(auth), request)));
    }

    @PutMapping("/applications/{id}/reject")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<LeaveApplicationDto>> reject(
            @PathVariable Long id,
            @RequestHeader("Authorization") String auth,
            @RequestBody(required = false) LeaveActionRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Rejected", leaveService.rejectLeave(id, getUserId(auth), request)));
    }

    @PutMapping("/applications/{id}/cancel")
    public ResponseEntity<ApiResponse<LeaveApplicationDto>> cancel(
            @PathVariable Long id,
            @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(ApiResponse.success("Cancelled", leaveService.cancelLeave(id, getUserId(auth))));
    }
}
