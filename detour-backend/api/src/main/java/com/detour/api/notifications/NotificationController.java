package com.detour.api.notifications;

import com.detour.api.notifications.dto.UnreadCountResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @Autowired
    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getForUser(@PathVariable Integer userId) {
        try {
            List<Notification> notifications = notificationService.getForUser(userId);
            return ResponseEntity.ok(notifications);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<?> getUnreadCount(@PathVariable Integer userId) {
        try {
            long count = notificationService.getUnreadCount(userId);
            return ResponseEntity.ok(new UnreadCountResponse(count));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(notificationService.markAsRead(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
