package com.raza.rmeals.service;

import com.raza.rmeals.exception.RestaurantException;
import com.raza.rmeals.model.Category;
import com.raza.rmeals.model.Restaurant;
import com.raza.rmeals.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryServiceImplementation implements CategoryService {

    @Autowired
    private RestaurantService restaurantService;

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public Category createCategory(String name, Long userId) throws RestaurantException {
        Restaurant restaurant = restaurantService.getRestaurantsByUserId(userId);
        Category createdCategory = new Category();

        createdCategory.setName(name);
        createdCategory.setRestaurant(restaurant);

        return categoryRepository.save(createdCategory);
    }

    @Override
    public List<Category> findCategoryByRestaurantId(Long id) throws RestaurantException {
        Restaurant restaurant = restaurantService.findRestaurantById(id);
        return categoryRepository.findByRestaurantId(id);
    }

    @Override
    public Category findCategoryById(Long id) throws RestaurantException {
        Optional<Category> opt=categoryRepository.findById(id);

        if(opt.isEmpty()) {
            throw new RestaurantException("category not exist with id "+id);
        }

        return opt.get();
    }
}
