package com.raza.rmeals.response;

import com.raza.rmeals.model.Address;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderAddressResponse {
    private Address restaurantAddress;
    private Address deliveryAddress;
}
