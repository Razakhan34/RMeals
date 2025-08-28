package com.raza.rmeals.service;

import java.util.List;

import com.raza.rmeals.dto.RestaurantDto;
import com.raza.rmeals.exception.RestaurantException;
import com.raza.rmeals.model.Restaurant;
import com.raza.rmeals.model.User;
import com.raza.rmeals.request.CreateRestaurantRequest;

public interface RestaurantService {
  public Restaurant createRestaurant(CreateRestaurantRequest req, User user);

  public Restaurant updateRestaurant(Long restaurantId, CreateRestaurantRequest updatedRestaurant)
      throws RestaurantException;

  public void deleteRestaurant(Long restaurantId) throws RestaurantException;

  public List<Restaurant> getAllRestaurant();

  public List<Restaurant> searchRestaurant(String keyword);

  public Restaurant findRestaurantById(Long id) throws RestaurantException;

  public Restaurant getRestaurantsByUserId(Long userId) throws RestaurantException;

  public RestaurantDto addToFavorites(Long restaurantId, User user) throws RestaurantException;
  public Restaurant updateRestaurantStatus(Long id) throws RestaurantException;

   public List<Restaurant> findNearbyRestaurants(double latitude, double longitude, int radiusKm);
}
