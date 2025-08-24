package com.raza.rmeals.controller;

import com.raza.rmeals.dto.RazorpayOrderResponse;
import com.raza.rmeals.exception.*;
import com.raza.rmeals.model.Order;
import com.raza.rmeals.model.User;
import com.raza.rmeals.request.CreateOrderRequest;
import com.raza.rmeals.response.OrderAddressResponse;
import com.raza.rmeals.response.PaymentResponse;
import com.raza.rmeals.service.OrderService;
import com.raza.rmeals.service.UserService;
import com.razorpay.RazorpayException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class OrderController {
    @Autowired
    private OrderService orderService;
    @Autowired
    private UserService userService;

    @PostMapping("/order/stripe")
    public ResponseEntity<PaymentResponse> createOrderStripe(@RequestBody CreateOrderRequest order,
                                             @RequestHeader("Authorization") String jwt)
            throws UserException, RestaurantException,
            CartException,
            OrderException, StripeException, com.stripe.exception.StripeException {
        User user=userService.findUserProfileByJwt(jwt);
        System.out.println("req user "+user.getEmail());
        if(order!=null && order.getPaymentMethod().equals("stripe")) {
            PaymentResponse res = orderService.createOrderStripe(order,user);
            return ResponseEntity.ok(res);
        }else throw new OrderException("Please provide valid request body");
    }

    @PostMapping("/order/razorpay")
    public ResponseEntity<RazorpayOrderResponse> createOrderRazorpay(@RequestBody CreateOrderRequest order,
                                                                     @RequestHeader("Authorization") String jwt)
            throws UserException, RestaurantException,
            CartException,
            OrderException, RazorpayException {

        User user=userService.findUserProfileByJwt(jwt);
        if(order!=null && order.getPaymentMethod().equals("razorpay")) {
            RazorpayOrderResponse res = orderService.createOrderRazorpay(order,user);
            return ResponseEntity.ok(res);
        }else throw new OrderException("Please provide valid request body");
    }

    @GetMapping("/track-order/{orderId}")
    public ResponseEntity<OrderAddressResponse> trackOrder(@PathVariable Long orderId,
                                                           @RequestHeader("Authorization") String jwt)
                                                            throws OrderException {
        // Get the order details by orderId
       OrderAddressResponse response = orderService.getOrderAddress(orderId);
        return ResponseEntity.ok(response);
    }

//    Get Details of single order
    @GetMapping("/order/{orderId}")
    public ResponseEntity<Order> getOrder(@PathVariable Long orderId,
                                                           @RequestHeader("Authorization") String jwt)
            throws OrderException {
        // Get the order details by orderId
        Order response = orderService.getOrder(orderId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/order/user")
    public ResponseEntity<List<Order>> getAllUserOrders(@RequestHeader("Authorization") String jwt) throws OrderException, UserException{

        User user=userService.findUserProfileByJwt(jwt);

        if(user.getId()!=null) {
            List<Order> userOrders = orderService.getUserOrders(user.getId());
            return ResponseEntity.ok(userOrders);
        }else {
            return new ResponseEntity<List<Order>>(HttpStatus.BAD_REQUEST);
        }
    }
}
