package com.revworkforce.employeemanagement.controller;

import com.revworkforce.employeemanagement.dto.*;
import com.revworkforce.employeemanagement.entity.Announcement;
import com.revworkforce.employeemanagement.exception.ResourceNotFoundException;
import com.revworkforce.employeemanagement.repository.AnnouncementRepository;
import com.revworkforce.employeemanagement.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController @RequestMapping("/api/announcements") @RequiredArgsConstructor
public class AnnouncementController {
    private final AnnouncementRepository announcementRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AnnouncementDto>>> getAll(@RequestHeader("Authorization") String auth) {
        String role = jwtTokenProvider.getRoleFromToken(auth.substring(7));
        List<AnnouncementDto> announcements = announcementRepository.findActiveAnnouncementsForRole(role, LocalDateTime.now()).stream()
            .map(a -> AnnouncementDto.builder().id(a.getId()).title(a.getTitle()).content(a.getContent()).postedById(a.getPostedById()).targetRole(a.getTargetRole()).isActive(a.isActive()).createdAt(a.getCreatedAt()).expiresAt(a.getExpiresAt()).build())
            .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Announcements", announcements));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AnnouncementDto>> create(@RequestHeader("Authorization") String auth, @RequestBody AnnouncementDto dto) {
        Long userId = jwtTokenProvider.getUserIdFromToken(auth.substring(7));
        Announcement a = Announcement.builder().title(dto.getTitle()).content(dto.getContent())
            .postedById(userId).targetRole(dto.getTargetRole() != null ? dto.getTargetRole() : "ALL")
            .isActive(true).expiresAt(dto.getExpiresAt()).build();
        a = announcementRepository.save(a);
        AnnouncementDto result = AnnouncementDto.builder().id(a.getId()).title(a.getTitle()).content(a.getContent()).postedById(a.getPostedById()).targetRole(a.getTargetRole()).isActive(a.isActive()).createdAt(a.getCreatedAt()).expiresAt(a.getExpiresAt()).build();
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<AnnouncementDto>builder().success(true).message("Created").data(result).statusCode(201).build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AnnouncementDto>> update(@PathVariable Long id, @RequestBody AnnouncementDto dto) {
        Announcement a = announcementRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Not found: " + id));
        if (dto.getTitle() != null) a.setTitle(dto.getTitle());
        if (dto.getContent() != null) a.setContent(dto.getContent());
        if (dto.getTargetRole() != null) a.setTargetRole(dto.getTargetRole());
        if (dto.getExpiresAt() != null) a.setExpiresAt(dto.getExpiresAt());
        a = announcementRepository.save(a);
        return ResponseEntity.ok(ApiResponse.success("Updated", AnnouncementDto.builder().id(a.getId()).title(a.getTitle()).content(a.getContent()).build()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        Announcement a = announcementRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Not found: " + id));
        a.setActive(false);
        announcementRepository.save(a);
        return ResponseEntity.ok(ApiResponse.success("Deleted", null));
    }
}
