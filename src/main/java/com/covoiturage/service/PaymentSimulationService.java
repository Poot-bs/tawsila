package com.covoiturage.service;

import com.covoiturage.dto.PaymentIntentRequest;
import com.covoiturage.exception.NotFoundException;
import com.covoiturage.exception.ValidationException;
import com.covoiturage.model.PaymentRecord;
import com.covoiturage.service.payment.PaymentProvider;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PaymentSimulationService {
    private final Map<String, PaymentRecord> store = new ConcurrentHashMap<>();
    private final PaymentProvider paymentProvider;

    public PaymentSimulationService(PaymentProvider paymentProvider) {
        this.paymentProvider = paymentProvider;
    }

    public PaymentRecord createIntent(PaymentIntentRequest request) {
        validateRequest(request);
        PaymentRecord record = new PaymentRecord();
        record.setId(UUID.randomUUID().toString());
        record.setReservationId(request.getReservationId());
        record.setPayerId(request.getPayerId());
        record.setMethod(request.getMethod().trim().toUpperCase());
        record.setAmount(request.getAmount());
        record.setCreatedAt(LocalDateTime.now());
        record.setUpdatedAt(LocalDateTime.now());

        paymentProvider.authorize(record);
        store.put(record.getId(), record);
        return record;
    }

    public PaymentRecord confirm(String id) {
        PaymentRecord record = getById(id);
        paymentProvider.capture(record);
        record.setUpdatedAt(LocalDateTime.now());
        return record;
    }

    public PaymentRecord refund(String id) {
        PaymentRecord record = getById(id);
        paymentProvider.refund(record);
        record.setUpdatedAt(LocalDateTime.now());
        return record;
    }

    public PaymentRecord getById(String id) {
        PaymentRecord record = store.get(id);
        if (record == null) {
            throw new NotFoundException("Paiement introuvable");
        }
        return record;
    }

    private void validateRequest(PaymentIntentRequest request) {
        if (request == null || isBlank(request.getReservationId()) || isBlank(request.getPayerId()) || isBlank(request.getMethod())) {
            throw new ValidationException("reservationId, payerId et method sont obligatoires");
        }
        String method = request.getMethod().trim().toUpperCase();
        if (!"CARD".equals(method) && !"CASH".equals(method)) {
            throw new ValidationException("method doit etre CARD ou CASH");
        }
        if (request.getAmount() <= 0) {
            throw new ValidationException("amount doit etre superieur a 0");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
