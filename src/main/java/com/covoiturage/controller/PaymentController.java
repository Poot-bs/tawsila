package com.covoiturage.controller;

import com.covoiturage.dto.PaymentIntentRequest;
import com.covoiturage.model.PaymentRecord;
import com.covoiturage.service.PaymentSimulationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final PaymentSimulationService paymentSimulationService;

    public PaymentController(PaymentSimulationService paymentSimulationService) {
        this.paymentSimulationService = paymentSimulationService;
    }

    @PostMapping("/intents")
    public PaymentRecord createIntent(@RequestBody PaymentIntentRequest request) {
        return paymentSimulationService.createIntent(request);
    }

    @PostMapping("/{id}/confirm")
    public PaymentRecord confirm(@PathVariable String id) {
        return paymentSimulationService.confirm(id);
    }

    @PostMapping("/{id}/refund")
    public PaymentRecord refund(@PathVariable String id) {
        return paymentSimulationService.refund(id);
    }

    @GetMapping("/{id}")
    public PaymentRecord getById(@PathVariable String id) {
        return paymentSimulationService.getById(id);
    }
}
