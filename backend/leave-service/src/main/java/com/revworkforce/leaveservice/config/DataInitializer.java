package com.revworkforce.leaveservice.config;

import com.revworkforce.leaveservice.entity.*;
import com.revworkforce.leaveservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final CompanyHolidayRepository companyHolidayRepository;

    @Override
    public void run(String... args) {
        if (leaveTypeRepository.count() > 0) return;
        log.info("Initializing leave seed data...");

        LeaveType annual = leaveTypeRepository.save(LeaveType.builder().name("Annual Leave").description("Paid annual leave").isPaid(true).isActive(true).build());
        LeaveType sick = leaveTypeRepository.save(LeaveType.builder().name("Sick Leave").description("Medical leave").isPaid(true).isActive(true).build());
        LeaveType casual = leaveTypeRepository.save(LeaveType.builder().name("Casual Leave").description("Short casual leave").isPaid(false).isActive(true).build());

        // Create balances for users 1-8 (will be created by user-service)
        int year = LocalDate.now().getYear();
        for (long userId = 1L; userId <= 8L; userId++) {
            leaveBalanceRepository.save(LeaveBalance.builder().userId(userId).leaveTypeId(annual.getId()).totalDays(18).usedDays(0).year(year).build());
            leaveBalanceRepository.save(LeaveBalance.builder().userId(userId).leaveTypeId(sick.getId()).totalDays(12).usedDays(0).year(year).build());
            leaveBalanceRepository.save(LeaveBalance.builder().userId(userId).leaveTypeId(casual.getId()).totalDays(6).usedDays(0).year(year).build());
        }

        // Company holidays
        List.of(
            CompanyHoliday.builder().name("New Year's Day").date(LocalDate.of(year, 1, 1)).isRecurring(true).build(),
            CompanyHoliday.builder().name("Independence Day").date(LocalDate.of(year, 8, 15)).isRecurring(true).build(),
            CompanyHoliday.builder().name("Gandhi Jayanti").date(LocalDate.of(year, 10, 2)).isRecurring(true).build(),
            CompanyHoliday.builder().name("Christmas").date(LocalDate.of(year, 12, 25)).isRecurring(true).build()
        ).forEach(companyHolidayRepository::save);

        log.info("Leave seed data initialized.");
    }
}
