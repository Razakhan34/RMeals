package com.raza.rmeals.service;

import com.raza.rmeals.exception.RestaurantException;
import com.raza.rmeals.model.Category;

import java.util.List;

public interface CategoryService {
    public Category createCategory (String name, Long userId) throws RestaurantException;
    public List<Category> findCategoryByRestaurantId(Long restaurantId) throws RestaurantException;
    public Category findCategoryById(Long id) throws RestaurantException;
}
