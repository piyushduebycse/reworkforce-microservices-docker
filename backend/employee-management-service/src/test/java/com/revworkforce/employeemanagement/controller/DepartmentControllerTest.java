package com.revworkforce.employeemanagement.controller;

import com.revworkforce.employeemanagement.entity.Department;
import com.revworkforce.employeemanagement.repository.DepartmentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import org.mockito.*;
import java.util.List;

@ExtendWith(MockitoExtension.class)
class DepartmentControllerTest {

    @Mock private DepartmentRepository departmentRepository;
    @Mock private com.revworkforce.employeemanagement.repository.DesignationRepository designationRepository;
    @InjectMocks private DepartmentController departmentController;

    @Test
    void getAll_ShouldReturnActiveDepartments() {
        Department dept = Department.builder().id(1L).name("Engineering").isActive(true).build();
        when(departmentRepository.findByIsActiveTrue()).thenReturn(List.of(dept));
        var response = departmentController.getAll();
        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertTrue(response.getBody().isSuccess());
    }
}
