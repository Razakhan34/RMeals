package com.raza.rmeals.controller;

import com.raza.rmeals.dto.RestaurantDto;
import com.raza.rmeals.exception.RestaurantException;
import com.raza.rmeals.exception.UserException;
import com.raza.rmeals.model.Restaurant;
import com.raza.rmeals.model.User;
import com.raza.rmeals.service.RestaurantService;
import com.raza.rmeals.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    @Autowired
    private UserService userService;


//    search restaturant
    @GetMapping("/search")
    public ResponseEntity<List<Restaurant>> findRestaurantByName(
            @RequestParam String keyword) {
        List<Restaurant> restaurant = restaurantService.searchRestaurant(keyword);

        return ResponseEntity.ok(restaurant);
    }

    //    api for getting restaurant nearby
    @GetMapping("/nearby-restaurants")
    public ResponseEntity<List<Restaurant>> getNearbyRestaurants() {
        //   @RequestParam double latitude,
        ////            @RequestParam double longitude,
        ////            @RequestParam(defaultValue = "5") int radiusKm
//        i will integrage  lat and longitude later but for now i am getting some dummy restaurant
        double latitude = 0.0f;
        double longitude = 0.0f;
        int radiusKm = 5;
        List<Restaurant> nearbyRestaurants = restaurantService.findNearbyRestaurants(latitude, longitude, radiusKm);
        return ResponseEntity.ok(nearbyRestaurants);
    }



    //    Get all restaurant details
    @GetMapping()
    public ResponseEntity<List<Restaurant>> getAllRestaurants() {

        List<Restaurant> restaurants = restaurantService.getAllRestaurant();


        return ResponseEntity.ok(restaurants);
    }

//  find restaurant detail by restaurant id
    @GetMapping("/{id}")
    public ResponseEntity<Restaurant> findRestaurantById(
            @PathVariable Long id) throws RestaurantException {

        Restaurant restaurant = restaurantService.findRestaurantById(id);
        return ResponseEntity.ok(restaurant);

    }

//    add to favourite of user wishlist
    @PutMapping("/{id}/add-favorites")
    public ResponseEntity<RestaurantDto> addToFavorite(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Long id) throws RestaurantException, UserException {

        User user = userService.findUserProfileByJwt(jwt);
        RestaurantDto restaurant = restaurantService.addToFavorites(id, user);
        return ResponseEntity.ok(restaurant);

    }
}
