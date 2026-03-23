package com.revworkforce.employeemanagement.controller;

import com.revworkforce.employeemanagement.dto.*;
import com.revworkforce.employeemanagement.entity.*;
import com.revworkforce.employeemanagement.exception.ResourceNotFoundException;
import com.revworkforce.employeemanagement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController @RequestMapping("/api/departments") @RequiredArgsConstructor
public class DepartmentController {
    private final DepartmentRepository departmentRepository;
    private final DesignationRepository designationRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DepartmentDto>>> getAll() {
        List<DepartmentDto> depts = departmentRepository.findAll().stream()
            .map(d -> DepartmentDto.builder().id(d.getId()).name(d.getName()).description(d.getDescription()).headEmployeeId(d.getHeadEmployeeId()).isActive(d.isActive()).build())
            .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Departments", depts));
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DepartmentDto>> activate(@PathVariable Long id) {
        Department d = departmentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Department not found: " + id));
        d.setActive(true);
        d = departmentRepository.save(d);
        DepartmentDto result = DepartmentDto.builder().id(d.getId()).name(d.getName()).description(d.getDescription()).headEmployeeId(d.getHeadEmployeeId()).isActive(d.isActive()).build();
        return ResponseEntity.ok(ApiResponse.success("Activated", result));
    }

    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DepartmentDto>> deactivate(@PathVariable Long id) {
        Department d = departmentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Department not found: " + id));
        d.setActive(false);
        d = departmentRepository.save(d);
        DepartmentDto result = DepartmentDto.builder().id(d.getId()).name(d.getName()).description(d.getDescription()).headEmployeeId(d.getHeadEmployeeId()).isActive(d.isActive()).build();
        return ResponseEntity.ok(ApiResponse.success("Deactivated", result));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DepartmentDto>> create(@RequestBody DepartmentDto dto) {
        Department d = Department.builder().name(dto.getName()).description(dto.getDescription()).headEmployeeId(dto.getHeadEmployeeId()).isActive(true).build();
        d = departmentRepository.save(d);
        DepartmentDto result = DepartmentDto.builder().id(d.getId()).name(d.getName()).description(d.getDescription()).headEmployeeId(d.getHeadEmployeeId()).isActive(d.isActive()).build();
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<DepartmentDto>builder().success(true).message("Created").data(result).statusCode(201).build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DepartmentDto>> update(@PathVariable Long id, @RequestBody DepartmentDto dto) {
        Department d = departmentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Department not found: " + id));
        if (dto.getName() != null) d.setName(dto.getName());
        if (dto.getDescription() != null) d.setDescription(dto.getDescription());
        if (dto.getHeadEmployeeId() != null) d.setHeadEmployeeId(dto.getHeadEmployeeId());
        d = departmentRepository.save(d);
        DepartmentDto result = DepartmentDto.builder().id(d.getId()).name(d.getName()).description(d.getDescription()).headEmployeeId(d.getHeadEmployeeId()).isActive(d.isActive()).build();
        return ResponseEntity.ok(ApiResponse.success("Updated", result));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        Department d = departmentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Department not found: " + id));
        d.setActive(false);
        departmentRepository.save(d);
        return ResponseEntity.ok(ApiResponse.success("Deleted", null));
    }

    @GetMapping("/internal/{id}")
    public ResponseEntity<ApiResponse<DepartmentDto>> getById(@PathVariable Long id) {
        Department d = departmentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Department not found: " + id));
        return ResponseEntity.ok(ApiResponse.success("Department", DepartmentDto.builder().id(d.getId()).name(d.getName()).description(d.getDescription()).headEmployeeId(d.getHeadEmployeeId()).isActive(d.isActive()).build()));
    }
}
