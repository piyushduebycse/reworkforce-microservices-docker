package com.revworkforce.leaveservice.repository;

import com.revworkforce.leaveservice.entity.CompanyHoliday;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface CompanyHolidayRepository extends JpaRepository<CompanyHoliday, Long> {
    List<CompanyHoliday> findByDateBetweenOrderByDate(LocalDate start, LocalDate end);
    List<CompanyHoliday> findAllByOrderByDateAsc();
    List<CompanyHoliday> findByDateAfterOrderByDate(LocalDate date);
}
