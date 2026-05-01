package com.covoiturage.service;

import com.covoiturage.model.Notification;
import com.covoiturage.model.User;
import com.covoiturage.repository.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(UserRepository userRepository, SimpMessagingTemplate messagingTemplate) {
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public void notifierEmail(User user, String message) {
        user.envoyerNotificationEmail(message);
        userRepository.save(user);
        List<Notification> notifs = user.getNotifications();
        if (!notifs.isEmpty()) {
            pushNotification(user.getIdentifiant(), notifs.get(notifs.size() - 1));
        }
    }

    public void notifierSMS(User user, String message) {
        user.envoyerNotificationSMS(message);
        userRepository.save(user);
        List<Notification> notifs = user.getNotifications();
        if (!notifs.isEmpty()) {
            pushNotification(user.getIdentifiant(), notifs.get(notifs.size() - 1));
        }
    }

    private void pushNotification(String userId, Object payload) {
        try {
            messagingTemplate.convertAndSend("/topic/notifications/" + userId, payload);
        } catch (Exception e) {
            // Ignore if broker not ready
        }
    }

    public List<Notification> getNotifications(User user) {
        return user.getNotifications();
    }
}
