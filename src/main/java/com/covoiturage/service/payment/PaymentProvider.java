package com.covoiturage.service.payment;

import com.covoiturage.model.PaymentRecord;

public interface PaymentProvider {
    PaymentRecord authorize(PaymentRecord record);
    PaymentRecord capture(PaymentRecord record);
    PaymentRecord refund(PaymentRecord record);
}
