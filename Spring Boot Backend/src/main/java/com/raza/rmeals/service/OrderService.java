package com.raza.rmeals.service;

import com.raza.rmeals.dto.RazorpayOrderResponse;
import com.raza.rmeals.exception.*;
import com.raza.rmeals.model.Order;
import com.raza.rmeals.model.User;
import com.raza.rmeals.request.CreateOrderRequest;
import com.raza.rmeals.response.OrderAddressResponse;
import com.raza.rmeals.response.PaymentResponse;
import com.razorpay.RazorpayException;

import java.util.List;

public interface OrderService {
    public PaymentResponse createOrderStripe(CreateOrderRequest order, User user) throws UserException,
            RestaurantException, CartException, StripeException, com.stripe.exception.StripeException;

    public RazorpayOrderResponse createOrderRazorpay(CreateOrderRequest order, User user)
            throws RestaurantException, CartException, UserException, RazorpayException;

    public Order updateOrder(Long orderId, String orderStatus) throws OrderException;

    public void cancelOrder(Long orderId) throws OrderException;

    public List<Order> getUserOrders(Long userId) throws OrderException;
    public OrderAddressResponse getOrderAddress(Long orderId) throws OrderException;

    public Order getOrder(Long orderId) throws OrderException;

    public List<Order> getOrdersOfRestaurant(Long restaurantId,String orderStatus)
            throws OrderException, RestaurantException;
}
