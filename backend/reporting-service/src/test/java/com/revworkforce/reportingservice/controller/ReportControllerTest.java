package com.revworkforce.reportingservice.controller;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class ReportControllerTest {

    @InjectMocks
    private ReportController reportController;

    @Test
    void getHeadcount_ShouldReturnData() {
        var response = reportController.getHeadcount();
        assertNotNull(response);
        assertTrue(response.getBody().isSuccess());
    }

    @Test
    void getGoalCompletion_ShouldReturnData() {
        var response = reportController.getGoalCompletion();
        assertNotNull(response);
        assertTrue(response.getBody().isSuccess());
    }
}
