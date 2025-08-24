package com.raza.rmeals.request;

import com.raza.rmeals.model.Address;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrderRequest {
    private Long restaurantId;
    private Address deliveryAddress;
    private String paymentMethod;
}
