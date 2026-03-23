package com.revworkforce.notificationservice.service;

import com.revworkforce.notificationservice.dto.NotificationRequest;
import com.revworkforce.notificationservice.entity.*;
import com.revworkforce.notificationservice.exception.ResourceNotFoundException;
import com.revworkforce.notificationservice.repository.NotificationRepository;
import com.revworkforce.notificationservice.service.impl.NotificationServiceImpl;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceImplTest {

    @Mock private NotificationRepository notificationRepository;
    @InjectMocks private NotificationServiceImpl notificationService;

    @Test
    void createNotification_ValidRequest_ShouldSave() {
        NotificationRequest req = NotificationRequest.builder()
                .recipientUserId(1L).title("Test").message("Test message").type("GENERAL").build();
        Notification saved = Notification.builder().id(1L).recipientUserId(1L).title("Test")
                .message("Test message").type(NotificationType.GENERAL).isRead(false).build();
        when(notificationRepository.save(any())).thenReturn(saved);

        var result = notificationService.createNotification(req);
        assertNotNull(result);
        assertEquals("Test", result.getTitle());
        assertFalse(result.isRead());
    }

    @Test
    void countUnread_ShouldReturnCount() {
        when(notificationRepository.countByRecipientUserIdAndIsReadFalse(1L)).thenReturn(5L);
        assertEquals(5L, notificationService.countUnread(1L));
    }

    @Test
    void markAsRead_NotFound_ShouldThrow() {
        when(notificationRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> notificationService.markAsRead(99L, 1L));
    }

    @Test
    void markAllAsRead_ShouldMarkAll() {
        Notification n1 = Notification.builder().id(1L).recipientUserId(1L).isRead(false).build();
        Notification n2 = Notification.builder().id(2L).recipientUserId(1L).isRead(false).build();
        when(notificationRepository.findByRecipientUserIdAndIsReadFalse(1L)).thenReturn(List.of(n1, n2));
        when(notificationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        notificationService.markAllAsRead(1L);
        assertTrue(n1.isRead());
        assertTrue(n2.isRead());
    }
}
