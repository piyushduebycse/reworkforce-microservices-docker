package com.revworkforce.employeemanagement.repository;

import com.revworkforce.employeemanagement.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    List<Department> findByIsActiveTrue();
}
