package com.revworkforce.employeemanagement.repository;

import com.revworkforce.employeemanagement.entity.Designation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DesignationRepository extends JpaRepository<Designation, Long> {
    List<Designation> findByIsActiveTrue();
    List<Designation> findByDepartmentIdAndIsActiveTrue(Long departmentId);
}
