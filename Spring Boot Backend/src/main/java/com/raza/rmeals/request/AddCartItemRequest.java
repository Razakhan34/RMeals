package com.raza.rmeals.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddCartItemRequest {
    private Long menuItemId;
    private int quantity;
    private List<String> ingredients;
}
