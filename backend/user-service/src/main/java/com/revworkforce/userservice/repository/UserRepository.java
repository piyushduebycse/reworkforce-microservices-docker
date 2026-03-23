package com.revworkforce.userservice.repository;

import com.revworkforce.userservice.entity.Role;
import com.revworkforce.userservice.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmployeeId(String employeeId);

    boolean existsByEmail(String email);

    boolean existsByEmployeeId(String employeeId);

    Page<User> findByIsActiveTrue(Pageable pageable);

    List<User> findByIsActiveTrue();

    List<User> findByManagerId(Long managerId);

    List<User> findByIdIn(List<Long> ids);

    @Query("SELECT u FROM User u WHERE u.isActive = true AND " +
           "(LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<User> searchActiveUsers(String query);

    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(u.employeeId, 5) AS int)), 0) FROM User u WHERE u.employeeId LIKE 'EMP-%'")
    Integer findMaxEmployeeIdNumber();
}
