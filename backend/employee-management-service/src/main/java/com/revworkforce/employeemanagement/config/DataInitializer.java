package com.revworkforce.employeemanagement.config;

import com.revworkforce.employeemanagement.entity.*;
import com.revworkforce.employeemanagement.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component @Profile("dev") @RequiredArgsConstructor @Slf4j
public class DataInitializer implements CommandLineRunner {
    private final DepartmentRepository departmentRepository;
    private final DesignationRepository designationRepository;
    private final AnnouncementRepository announcementRepository;

    @Override
    public void run(String... args) {
        if (departmentRepository.count() > 0) return;
        log.info("Initializing employee management seed data...");
        Department eng = departmentRepository.save(Department.builder().name("Engineering").description("Software Development").isActive(true).build());
        Department hr = departmentRepository.save(Department.builder().name("Human Resources").description("HR Department").isActive(true).build());
        Department finance = departmentRepository.save(Department.builder().name("Finance").description("Finance Department").isActive(true).build());
        Department mkt = departmentRepository.save(Department.builder().name("Marketing").description("Marketing Department").isActive(true).build());
        Department ops = departmentRepository.save(Department.builder().name("Operations").description("Operations Department").isActive(true).build());

        designationRepository.save(Designation.builder().name("Software Engineer").level("Junior").departmentId(eng.getId()).isActive(true).build());
        designationRepository.save(Designation.builder().name("Senior Software Engineer").level("Senior").departmentId(eng.getId()).isActive(true).build());
        designationRepository.save(Designation.builder().name("Tech Lead").level("Lead").departmentId(eng.getId()).isActive(true).build());
        designationRepository.save(Designation.builder().name("HR Executive").level("Mid").departmentId(hr.getId()).isActive(true).build());
        designationRepository.save(Designation.builder().name("Finance Analyst").level("Mid").departmentId(finance.getId()).isActive(true).build());

        announcementRepository.save(Announcement.builder().title("Welcome to RevWorkforce!").content("We are excited to launch our new HR platform. Please explore all features and provide feedback.").postedById(1L).targetRole("ALL").isActive(true).build());
        log.info("Employee management seed data initialized.");
    }
}
