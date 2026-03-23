package com.revworkforce.employeemanagement.controller;

import com.revworkforce.employeemanagement.dto.ApiResponse;
import com.revworkforce.employeemanagement.dto.DesignationDto;
import com.revworkforce.employeemanagement.entity.Designation;
import com.revworkforce.employeemanagement.exception.ResourceNotFoundException;
import com.revworkforce.employeemanagement.repository.DesignationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/designations")
@RequiredArgsConstructor
public class DesignationController {

    private final DesignationRepository designationRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DesignationDto>>> getAll() {
        List<DesignationDto> designations = designationRepository.findByIsActiveTrue().stream()
                .map(d -> DesignationDto.builder().id(d.getId()).name(d.getName()).level(d.getLevel())
                        .departmentId(d.getDepartmentId()).isActive(d.isActive()).build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Designations", designations));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DesignationDto>> create(@RequestBody DesignationDto dto) {
        Designation d = Designation.builder().name(dto.getName()).level(dto.getLevel())
                .departmentId(dto.getDepartmentId()).isActive(true).build();
        d = designationRepository.save(d);
        DesignationDto result = DesignationDto.builder().id(d.getId()).name(d.getName()).level(d.getLevel())
                .departmentId(d.getDepartmentId()).isActive(d.isActive()).build();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<DesignationDto>builder().success(true).message("Created").data(result).statusCode(201).build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DesignationDto>> update(@PathVariable Long id, @RequestBody DesignationDto dto) {
        Designation d = designationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Designation not found: " + id));
        if (dto.getName() != null) d.setName(dto.getName());
        if (dto.getLevel() != null) d.setLevel(dto.getLevel());
        if (dto.getDepartmentId() != null) d.setDepartmentId(dto.getDepartmentId());
        d = designationRepository.save(d);
        DesignationDto result = DesignationDto.builder().id(d.getId()).name(d.getName()).level(d.getLevel())
                .departmentId(d.getDepartmentId()).isActive(d.isActive()).build();
        return ResponseEntity.ok(ApiResponse.success("Updated", result));
    }
}
