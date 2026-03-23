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
                .employeeId("EMP-001")
                .firstName("Admin")
                .lastName("User")
                .email("admin@revworkforce.com")
                .password(passwordEncoder.encode("Admin@123"))
                .role(Role.ADMIN)
                .isActive(true)
                .build();
        admin = userRepository.save(admin);

        User manager1 = User.builder()
                .employeeId("EMP-002")
                .firstName("John")
                .lastName("Manager")
                .email("manager1@revworkforce.com")
                .password(passwordEncoder.encode("Manager@123"))
                .role(Role.MANAGER)
                .isActive(true)
                .build();
        manager1 = userRepository.save(manager1);

        User manager2 = User.builder()
                .employeeId("EMP-003")
                .firstName("Sarah")
                .lastName("Lead")
                .email("manager2@revworkforce.com")
                .password(passwordEncoder.encode("Manager@123"))
                .role(Role.MANAGER)
                .isActive(true)
                .build();
        userRepository.save(manager2);

        String[] firstNames = {"Alice", "Bob", "Charlie", "Diana", "Edward"};
        String[] lastNames = {"Smith", "Jones", "Brown", "Taylor", "Wilson"};
        for (int i = 0; i < 5; i++) {
            User emp = User.builder()
                    .employeeId(String.format("EMP-%03d", i + 4))
                    .firstName(firstNames[i])
                    .lastName(lastNames[i])
                    .email("employee" + (i + 1) + "@revworkforce.com")
                    .password(passwordEncoder.encode("Employee@123"))
                    .role(Role.EMPLOYEE)
                    .managerId(manager1.getId())
                    .isActive(true)
                    .build();
            userRepository.save(emp);
        }

        log.info("Seed data initialized successfully!");
    }
}
