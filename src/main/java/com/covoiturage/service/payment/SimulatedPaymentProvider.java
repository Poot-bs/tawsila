package com.covoiturage.service.payment;

import com.covoiturage.model.PaymentRecord;
import com.covoiturage.model.SimulatedPaymentStatus;
import org.springframework.stereotype.Component;

@Component
public class SimulatedPaymentProvider implements PaymentProvider {
    @Override
    public PaymentRecord authorize(PaymentRecord record) {
        record.setStatus(SimulatedPaymentStatus.PENDING);
        return record;
    }

    @Override
    public PaymentRecord capture(PaymentRecord record) {
        record.setStatus(SimulatedPaymentStatus.PAID);
        return record;
    }

    @Override
    public PaymentRecord refund(PaymentRecord record) {
        record.setStatus(SimulatedPaymentStatus.REFUNDED);
        return record;
    }
}
