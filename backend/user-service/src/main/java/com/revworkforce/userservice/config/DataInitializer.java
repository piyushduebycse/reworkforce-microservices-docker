package com.revworkforce.userservice.config;

import com.revworkforce.userservice.entity.Role;
import com.revworkforce.userservice.entity.User;
import com.revworkforce.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Data already initialized, skipping...");
            return;
        }

        log.info("Initializing seed data...");

        User admin = User.builder()
                .employeeId("ADM-001")
                .firstName("Admin")
                .lastName("User")
                .email("admin@revworkforce.com")
                .password(passwordEncoder.encode("Admin@123"))
                .role(Role.ADMIN)
                .departmentId(1L)
                .isActive(true)
                .build();
        admin = userRepository.save(admin);

        User manager1 = User.builder()
                .employeeId("MGR-001")
                .firstName("John")
                .lastName("Manager")
                .email("manager1@revworkforce.com")
                .password(passwordEncoder.encode("Manager@123"))
                .role(Role.MANAGER)
                .managerId(admin.getId())
                .departmentId(1L)
                .isActive(true)
                .build();
        manager1 = userRepository.save(manager1);

        User manager2 = User.builder()
                .employeeId("MGR-002")
                .firstName("Sarah")
                .lastName("Lead")
                .email("manager2@revworkforce.com")
                .password(passwordEncoder.encode("Manager@123"))
                .role(Role.MANAGER)
                .managerId(admin.getId())
                .departmentId(2L)
                .isActive(true)
                .build();
        manager2 = userRepository.save(manager2);

        String[] firstNames = {"Alice", "Bob", "Charlie", "Diana", "Edward"};
        String[] lastNames = {"Smith", "Jones", "Brown", "Taylor", "Wilson"};
        Long[] managerIds = {manager1.getId(), manager1.getId(), manager1.getId(), manager2.getId(), manager2.getId()};
        Long[] deptIds = {1L, 1L, 1L, 2L, 2L};
        for (int i = 0; i < 5; i++) {
            User emp = User.builder()
                    .employeeId(String.format("EMP-%03d", i + 1))
                    .firstName(firstNames[i])
                    .lastName(lastNames[i])
                    .email("employee" + (i + 1) + "@revworkforce.com")
                    .password(passwordEncoder.encode("Employee@123"))
                    .role(Role.EMPLOYEE)
                    .managerId(managerIds[i])
                    .departmentId(deptIds[i])
                    .isActive(true)
                    .build();
            userRepository.save(emp);
        }

        log.info("Seed data initialized successfully!");
    }
}
