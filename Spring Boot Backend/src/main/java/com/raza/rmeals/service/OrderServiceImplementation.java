package com.raza.rmeals.service;

import com.raza.rmeals.dto.RazorpayOrderResponse;
import com.raza.rmeals.exception.*;
import com.raza.rmeals.model.*;
import com.raza.rmeals.repository.*;
import com.raza.rmeals.request.CreateOrderRequest;
import com.raza.rmeals.response.OrderAddressResponse;
import com.raza.rmeals.response.PaymentResponse;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import jakarta.transaction.Transactional;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OrderServiceImplementation implements OrderService {
    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PaymentService paymentService;

//    @Autowired
//    private NotificationService notificationService;


    @Value("${razorpay.key.id}")
    private String razorpayKeyId;
    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;


    @Override
    public PaymentResponse createOrderStripe(CreateOrderRequest order, User user) throws UserException,
            RestaurantException, CartException, StripeException, com.stripe.exception.StripeException {

        Order savedOrder = processAndSaveOrder(order, user);
//        stripe payment related stuff
        try {
            PaymentResponse res = paymentService.generatePaymentLink(savedOrder,savedOrder.getDeliveryAddress());
            return res;
        }
        catch (Exception e) {
            // If Razorpay order creation fails, delete the created order
            //deleteOrderAndCleanup(savedOrder);
            throw e;
        }
    }

    @Override
    public RazorpayOrderResponse createOrderRazorpay(CreateOrderRequest order, User user) throws RestaurantException, CartException, UserException, RazorpayException {


        Order savedOrder = processAndSaveOrder(order, user);

        try {
            //        Razorpay payment related stuff
            RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", savedOrder.getTotalAmount() * 100);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "order_rcptid_"+System.currentTimeMillis());
            orderRequest.put("payment_capture", 1);

            com.razorpay.Order orderRazorpay = razorpayClient.orders.create(orderRequest);

            return RazorpayOrderResponse.builder()
                    .id(orderRazorpay.get("id"))
                    .entity(orderRazorpay.get("entity"))
                    .amount(orderRazorpay.get("amount"))
                    .currency(orderRazorpay.get("currency"))
                    .status(orderRazorpay.get("status"))
                    .created_at(orderRazorpay.get("created_at"))
                    .receipt(orderRazorpay.get("receipt"))
                    .orderId(savedOrder.getId())
                    .build();

        }catch (Exception e) {
            // If Razorpay order creation fails, delete the created order
            deleteOrderAndCleanup(savedOrder);
            throw e;
        }
    }

    /**
     * Common logic for processing, validating, and saving the order, for createOrderStripe and CreateOrderRazorpay
     */
    private Order processAndSaveOrder(CreateOrderRequest order, User user) throws UserException, RestaurantException, CartException {

        Address shippAddress = order.getDeliveryAddress();

        // Check if the address already exists
        boolean addressExists = user.getAddresses().stream()
                .anyMatch(existingAddress ->
                        existingAddress.getFullName().equals(shippAddress.getFullName()) &&
                                existingAddress.getStreetAddress().equals(shippAddress.getStreetAddress()) &&
                                existingAddress.getCity().equals(shippAddress.getCity()) &&
                                existingAddress.getState().equals(shippAddress.getState()) &&
                                existingAddress.getPostalCode().equals(shippAddress.getPostalCode()) &&
                                existingAddress.getCountry().equals(shippAddress.getCountry()) &&
                                Math.abs(existingAddress.getLatitude() - shippAddress.getLatitude()) < 0.00001 &&
                                Math.abs(existingAddress.getLongitude() - shippAddress.getLongitude()) < 0.00001
                );

        Address savedAddress = addressRepository.save(shippAddress);

        if (!addressExists) {
            user.getAddresses().add(savedAddress);
        }

        userRepository.save(user);

        Optional<Restaurant> restaurant = restaurantRepository.findById(order.getRestaurantId());
        if (restaurant.isEmpty()) {
            throw new RestaurantException("Restaurant not found with id " + order.getRestaurantId());
        }

        Order createdOrder = new Order();
        createdOrder.setCustomer(user);
        createdOrder.setDeliveryAddress(savedAddress);
        createdOrder.setCreatedAt(new Date());
        createdOrder.setOrderStatus("PENDING");
        createdOrder.setRestaurant(restaurant.get());

        Cart cart = cartService.findCartByUserId(user.getId());

        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setFood(cartItem.getFood());
            orderItem.setIngredients(cartItem.getIngredients());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setTotalPrice(cartItem.getFood().getPrice() * cartItem.getQuantity());

            OrderItem savedOrderItem = orderItemRepository.save(orderItem);
            orderItems.add(savedOrderItem);
        }

        int delivery_fees = 21;
        int platform_fees = 5;
        int gst_and_restaurant_charge = 33; // calculate gst later

        Long totalPrice = cartService.calculateCartTotals(cart) + delivery_fees + platform_fees
                + gst_and_restaurant_charge;

        createdOrder.setTotalAmount(totalPrice);
        createdOrder.setTotalItem(cart.getItems().size());
        createdOrder.setItems(orderItems);

        Order savedOrder = orderRepository.save(createdOrder);

        restaurant.get().getOrders().add(savedOrder);
        restaurantRepository.save(restaurant.get());

        return savedOrder;
    }

    /**
     * Delete order and cleanup related data when payment fails
     */
    @Transactional
    protected void deleteOrderAndCleanup(Order order) {
        try {
            // Remove order from restaurant's orders list
            Restaurant restaurant = order.getRestaurant();
            if (restaurant != null && restaurant.getOrders() != null) {
                restaurant.getOrders().remove(order);
                restaurantRepository.save(restaurant);
            }

            // Delete order items first (due to foreign key constraints)
            if (order.getItems() != null) {
                orderItemRepository.deleteAll(order.getItems());
            }

            // Delete the order
            orderRepository.delete(order);

            System.out.println("Order " + order.getId() + " deleted due to payment failure");
        } catch (Exception e) {
            System.err.println("Error deleting order: " + e.getMessage());
        }
    }

    /**
     * New method to handle payment failure cleanup from external calls
     */
    @Override
    @Transactional
    public void handlePaymentFailure(Long orderId) throws OrderException {
        Order order = findOrderById(orderId);
        if(order==null) {
            throw new OrderException("Order not found with the id "+orderId);
        }

        // Only delete if order is still in PENDING status
        if ("PENDING".equals(order.getOrderStatus())) {
            deleteOrderAndCleanup(order);
        }
    }

//    if admin want to cancel the order
//    @Override
    public void cancelOrder(Long orderId) throws OrderException {
        Order order = findOrderById(orderId);
        if(order==null) {
            throw new OrderException("Order not found with the id "+orderId);
        }

        orderRepository.deleteById(orderId);

    }

    @Override
    public OrderAddressResponse getOrderAddress(Long orderId) throws OrderException {
        Order order = findOrderById(orderId);

        if (order == null) {
            throw new OrderException("Order not found with the id "+orderId);
        }

        // Get the restaurant address and user delivery address
        Address restaurantAddress = order.getRestaurant().getAddress();
        Address deliveryAddress = order.getDeliveryAddress();

        // Prepare the response
        OrderAddressResponse orderAddressResponse = new OrderAddressResponse();
        orderAddressResponse.setRestaurantAddress(restaurantAddress);
        orderAddressResponse.setDeliveryAddress(deliveryAddress);
        orderAddressResponse.setOrder(order);
        return orderAddressResponse;
    }

    @Override
    public Order getOrder(Long orderId) throws OrderException {
        return findOrderById(orderId);
    }

    public Order findOrderById(Long orderId) throws OrderException {
        Optional<Order> order = orderRepository.findById(orderId);
        if(order.isPresent()) return order.get();

        throw new OrderException("Order not found with the id "+orderId);
    }

    @Override
    public List<Order> getUserOrders(Long userId) throws OrderException {
        List<Order> orders=orderRepository.findAllUserOrders(userId);
        return orders;
    }

    @Override
    public List<Order> getOrdersOfRestaurant(Long restaurantId,String orderStatus) throws OrderException, RestaurantException {

        List<Order> orders = orderRepository.findOrdersByRestaurantId(restaurantId);

        if(orderStatus!=null) {
            orders = orders.stream()
                    .filter(order->order.getOrderStatus().equals(orderStatus))
                    .collect(Collectors.toList());
        }

        return orders;
    }
//    private List<MenuItem> filterByVegetarian(List<MenuItem> menuItems, boolean isVegetarian) {
//    return menuItems.stream()
//            .filter(menuItem -> menuItem.isVegetarian() == isVegetarian)
//            .collect(Collectors.toList());
//}



    @Override
    public Order updateOrder(Long orderId, String orderStatus) throws OrderException {
        Order order=findOrderById(orderId);

        System.out.println("--------- "+orderStatus);

        if(orderStatus.equals("OUT_FOR_DELIVERY") || orderStatus.equals("DELIVERED")
                || orderStatus.equals("SHIPPED") || orderStatus.equals("PENDING")) {
            order.setOrderStatus(orderStatus);
//            Notification notification=notificationicationService.sendOrderStatusNotification(order);
            return orderRepository.save(order);
        }
        else throw new OrderException("Please Select A Valid Order Status");


    }
}
