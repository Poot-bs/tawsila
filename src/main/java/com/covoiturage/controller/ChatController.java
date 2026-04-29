package com.covoiturage.controller;

import com.covoiturage.dto.ChatMessageRequest;
import com.covoiturage.model.ChatMessage;
import com.covoiturage.service.ChatService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(ChatService chatService, SimpMessagingTemplate messagingTemplate) {
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
    }

    @GetMapping("/rooms/{roomId}/messages")
    public List<ChatMessage> getMessages(@PathVariable String roomId) {
        return chatService.getMessages(roomId);
    }

    @PostMapping("/rooms/{roomId}/messages")
    public ChatMessage sendMessage(@PathVariable String roomId, @RequestBody ChatMessageRequest request) {
        return chatService.saveMessage(roomId, request);
    }

    @MessageMapping("/chat.send/{roomId}")
    public void sendMessageRealtime(@DestinationVariable String roomId, @Payload ChatMessageRequest request) {
        ChatMessage message = chatService.saveMessage(roomId, request);
        messagingTemplate.convertAndSend("/topic/chat/" + roomId, message);
    }
}
