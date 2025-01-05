package com.raza.rmeals.service;

import com.raza.rmeals.exception.RestaurantException;
import com.raza.rmeals.model.IngredientCategory;
import com.raza.rmeals.model.IngredientsItem;

import java.util.List;

public interface IngredientService {
    public IngredientCategory createIngredientsCategory(
            String name,Long restaurantId) throws RestaurantException;

    public IngredientCategory findIngredientsCategoryById(Long id) throws Exception;

    public List<IngredientCategory> findIngredientsCategoryByRestaurantId(Long id) throws Exception;

    public List<IngredientsItem> findRestaurantsIngredients(
            Long restaurantId);


    public IngredientsItem createIngredientsItem(Long restaurantId,
                                                 String ingredientName,Long ingredientCategoryId) throws Exception;

    public IngredientsItem updateStoke(Long id) throws Exception;
}
