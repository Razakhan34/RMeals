package com.raza.rmeals.controller;

import com.raza.rmeals.exception.FoodException;
import com.raza.rmeals.model.Food;
import com.raza.rmeals.model.Restaurant;
import com.raza.rmeals.service.FoodService;
import com.raza.rmeals.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/food")
public class MenuItemController {
    @Autowired
    private FoodService menuItemService;

    @Autowired
    private UserService userService;

    @GetMapping("/search")
    public ResponseEntity<List<Food>> searchFood(
            @RequestParam String name) {
        List<Food> menuItem = menuItemService.searchFood(name);
        return ResponseEntity.ok(menuItem);
    }

    @GetMapping("/popular-cuisines")
    public ResponseEntity<List<Food>> getPopularCuisines(
            @RequestParam(defaultValue = "9") int limit) {
        List<Food> popular = menuItemService.getPopularCuisines(limit);
        return ResponseEntity.ok(popular);
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<Food>> getMenuItemByRestaurantId(
            @PathVariable Long restaurantId,
            @RequestParam boolean vegetarian,
            @RequestParam boolean seasonal,
            @RequestParam boolean nonveg,
            @RequestParam(required = false) String food_category) throws FoodException {
        List<Food> menuItems = menuItemService.getRestaurantsFood(
                restaurantId, vegetarian, nonveg, seasonal, food_category);
        return ResponseEntity.ok(menuItems);
    }
}
