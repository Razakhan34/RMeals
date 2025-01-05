package com.raza.rmeals.service;

import com.raza.rmeals.exception.StripeException;
import com.raza.rmeals.model.Address;
import com.raza.rmeals.model.Order;
import com.raza.rmeals.model.User;
import com.raza.rmeals.response.PaymentResponse;

public interface PaymentService {
    public PaymentResponse generatePaymentLink(Order order, Address savedAddress) throws StripeException, com.stripe.exception.StripeException;
}
