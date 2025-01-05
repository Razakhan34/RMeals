package com.raza.rmeals.service;

import com.raza.rmeals.exception.*;
import com.raza.rmeals.model.*;
import com.raza.rmeals.repository.*;
import com.raza.rmeals.request.CreateOrderRequest;
import com.raza.rmeals.response.PaymentResponse;
import org.springframework.beans.factory.annotation.Autowired;
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




    @Override
    public PaymentResponse createOrder(CreateOrderRequest order, User user) throws UserException,
            RestaurantException, CartException, StripeException, com.stripe.exception.StripeException {

        Address shippAddress = order.getDeliveryAddress();

        // Check if the address already exists using stream and filter
        boolean addressExists = user.getAddresses().stream()
                .anyMatch(existingAddress ->
                        existingAddress.getFullName().equals(shippAddress.getFullName()) &&
                                existingAddress.getStreetAddress().equals(shippAddress.getStreetAddress()) &&
                                existingAddress.getCity().equals(shippAddress.getCity()) &&
                                existingAddress.getState().equals(shippAddress.getState()) &&
                                existingAddress.getPostalCode().equals(shippAddress.getPostalCode()) &&
                                existingAddress.getCountry().equals(shippAddress.getCountry())
        );

        Address savedAddress = addressRepository.save(shippAddress);

        if (!addressExists) {
            user.getAddresses().add(savedAddress);
        }



        userRepository.save(user);

        Optional<Restaurant> restaurant = restaurantRepository.findById(order.getRestaurantId());
        if(restaurant.isEmpty()) {
            throw new RestaurantException("Restaurant not found with id "+order.getRestaurantId());
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
            orderItem.setTotalPrice(cartItem.getFood().getPrice()* cartItem.getQuantity());

            OrderItem savedOrderItem = orderItemRepository.save(orderItem);
            orderItems.add(savedOrderItem);
        }

        Long totalPrice = cartService.calculateCartTotals(cart);

        createdOrder.setTotalAmount(totalPrice);
        createdOrder.setTotalItem(cart.getItems().size());
        createdOrder.setRestaurant(restaurant.get());

        createdOrder.setItems(orderItems);
        Order savedOrder = orderRepository.save(createdOrder);

        restaurant.get().getOrders().add(savedOrder);

        restaurantRepository.save(restaurant.get());

        PaymentResponse res = paymentService.generatePaymentLink(savedOrder,savedAddress);
        return res;
    }

    @Override
    public void cancelOrder(Long orderId) throws OrderException {
        Order order =findOrderById(orderId);
        if(order==null) {
            throw new OrderException("Order not found with the id "+orderId);
        }

        orderRepository.deleteById(orderId);

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
                || orderStatus.equals("COMPLETED") || orderStatus.equals("PENDING")) {
            order.setOrderStatus(orderStatus);
//            Notification notification=notificationicationService.sendOrderStatusNotification(order);
            return orderRepository.save(order);
        }
        else throw new OrderException("Please Select A Valid Order Status");


    }
}
