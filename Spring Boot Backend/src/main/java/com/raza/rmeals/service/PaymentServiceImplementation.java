package com.raza.rmeals.service;

import com.raza.rmeals.exception.StripeException;
import com.raza.rmeals.model.Address;
import com.raza.rmeals.model.Order;
import com.raza.rmeals.response.PaymentResponse;
import com.stripe.Stripe;
import com.stripe.model.Customer;
import com.stripe.model.checkout.Session;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class PaymentServiceImplementation implements PaymentService {
    @Value("${stripe.api.key}")
    private String stripeSecretKey;

    @Value("${app.frontend.url}")
    private String frontendBaseUrl;

    @Override
    public PaymentResponse generatePaymentLink(Order order, Address savedAddress) throws StripeException, com.stripe.exception.StripeException {

        Stripe.apiKey = stripeSecretKey;

//        SessionCreateParams params = SessionCreateParams.builder()
//                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
//                .setMode(SessionCreateParams.Mode.PAYMENT)
//                .setSuccessUrl("http://localhost:3000/payment/success/"+order.getId())
//                .setCancelUrl("http://localhost:3000/cancel")
//                .addLineItem(SessionCreateParams.LineItem.builder()
//                        .setQuantity(1L)
//                        .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
//                                .setCurrency("inr")
//                                .setUnitAmount((long) order.getTotalAmount()*100) // Specify the order amount in cents
//                                .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
//                                        .setName("pizza burger")
//                                        .build())
//                                .build())
//                        .build())
//                .build();

        // Create a Customer
        CustomerCreateParams customerParams = CustomerCreateParams.builder()
                .setName(savedAddress.getFullName()) // Replace with actual customer name
                .setAddress(CustomerCreateParams.Address.builder()
                        .setLine1(savedAddress.getCity()) // Customer's street address
                        .setCity(savedAddress.getCity())        // Customer's city
                        .setState(savedAddress.getState())      // Customer's state
                        .setPostalCode(savedAddress.getPostalCode())     // Customer's postal code
                        .setCountry(savedAddress.getCountry())            // Country code for India
                        .build())
                .build();

        Customer customer = Customer.create(customerParams);

        SessionCreateParams params = SessionCreateParams.builder()
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(frontendBaseUrl + "/payment/success/" + order.getId())
                .setCancelUrl(frontendBaseUrl + "/payment/failed?reason=cancelled")
                .setCustomer(customer.getId())
                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("inr")
                                .setUnitAmount((long) order.getTotalAmount() * 100L) // Specify the order amount in cents
                                .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName("RMeals")
                                        .build())
                                .build())
                        .build()).build();


        Session session = Session.create(params);

//        System.out.println("session _____ " + session);

        PaymentResponse res = new PaymentResponse();
        res.setPayment_url(session.getUrl());

        return res;

    }
}
