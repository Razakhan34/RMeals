package com.raza.rmeals.service;

import com.raza.rmeals.exception.FoodException;
import com.raza.rmeals.exception.RestaurantException;
import com.raza.rmeals.model.Category;
import com.raza.rmeals.model.Food;
import com.raza.rmeals.model.Restaurant;
import com.raza.rmeals.request.CreateFoodRequest;

import java.util.List;

public interface FoodService {
    public Food createFood(CreateFoodRequest req, Category category,
                          Restaurant restaurant) throws FoodException, RestaurantException;

    void deleteFood(Long foodId) throws FoodException;

    public List<Food> getRestaurantsFood(Long restaurantId,
                                         boolean isVegetarian, boolean isNonVeg,
                                         boolean isSeasonal, String foodCategory) throws FoodException;

    public List<Food> searchFood(String keyword);

    public Food findFoodById(Long foodId) throws FoodException;

    public Food updateAvailibilityStatus(Long foodId) throws FoodException;
}
