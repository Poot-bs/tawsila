package com.covoiturage.service;

import com.covoiturage.dto.ChatMessageRequest;
import com.covoiturage.exception.ValidationException;
import com.covoiturage.model.ChatMessage;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ChatService {
    private final Map<String, List<ChatMessage>> messagesByRoom = new ConcurrentHashMap<>();

    public ChatMessage saveMessage(String roomId, ChatMessageRequest request) {
        validate(roomId, request);
        ChatMessage message = new ChatMessage();
        message.setId(UUID.randomUUID().toString());
        message.setRoomId(roomId);
        message.setSenderId(request.getSenderId().trim());
        message.setRecipientId(request.getRecipientId() == null ? null : request.getRecipientId().trim());
        message.setContent(request.getContent().trim());
        message.setCreatedAt(LocalDateTime.now());

        messagesByRoom.computeIfAbsent(roomId, key -> new ArrayList<>()).add(message);
        return message;
    }

    public List<ChatMessage> getMessages(String roomId) {
        return messagesByRoom.getOrDefault(roomId, List.of()).stream()
            .sorted(Comparator.comparing(ChatMessage::getCreatedAt))
            .toList();
    }

    private void validate(String roomId, ChatMessageRequest request) {
        if (isBlank(roomId)) {
            throw new ValidationException("roomId est obligatoire");
        }
        if (request == null || isBlank(request.getSenderId()) || isBlank(request.getContent())) {
            throw new ValidationException("senderId et content sont obligatoires");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
