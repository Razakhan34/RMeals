package com.raza.rmeals.controller;

import com.raza.rmeals.exception.RestaurantException;
import com.raza.rmeals.exception.UserException;
import com.raza.rmeals.model.Restaurant;
import com.raza.rmeals.model.User;
import com.raza.rmeals.request.CreateRestaurantRequest;
import com.raza.rmeals.response.ApiResponse;
import com.raza.rmeals.service.RestaurantService;
import com.raza.rmeals.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/restaurants")
public class AdminRestaurantController {
    @Autowired
    private RestaurantService restaurantService;

    @Autowired
    private UserService userService;

//    creating new restaurant
    @PostMapping()
    public ResponseEntity<Restaurant> createRestaurant(
            @RequestBody CreateRestaurantRequest req,
            @RequestHeader("Authorization") String jwt) throws UserException {
        System.out.println("Creating Restaurant..");
        User user = userService.findUserProfileByJwt(jwt);
        Restaurant restaurant = restaurantService.createRestaurant(req, user);
        return ResponseEntity.ok(restaurant);
    }

//    update the restaurant
    @PutMapping("/{id}")
    public ResponseEntity<Restaurant> updateRestaurant(@PathVariable Long id,
                                                       @RequestBody CreateRestaurantRequest req,
                                                       @RequestHeader("Authorization") String jwt)
            throws RestaurantException, UserException {
        User user = userService.findUserProfileByJwt(jwt);

        Restaurant restaurant = restaurantService.updateRestaurant(id, req);
        return ResponseEntity.ok(restaurant);
    }

//  Deleting the restaurant..
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteRestaurantById(@PathVariable("id") Long restaurantId,
                                                            @RequestHeader("Authorization") String jwt) throws RestaurantException, UserException {
        User user = userService.findUserProfileByJwt(jwt);

        restaurantService.deleteRestaurant(restaurantId);

        ApiResponse res=new ApiResponse("Restaurant Deleted with id Successfully",true);
        return ResponseEntity.ok(res);
    }


//    updating the restarant status..
    @PutMapping("/{id}/status")
    public ResponseEntity<Restaurant> updateRestaurantStatus(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Long id) throws RestaurantException, UserException {

        Restaurant restaurant = restaurantService.updateRestaurantStatus(id);
        return ResponseEntity.ok(restaurant);

    }

//    find restaurant by user id
    @GetMapping("/user")
    public ResponseEntity<Restaurant> findRestaurantByUserId(
            @RequestHeader("Authorization") String jwt) throws RestaurantException, UserException {
        User user = userService.findUserProfileByJwt(jwt);
        Restaurant restaurant = restaurantService.getRestaurantsByUserId(user.getId());
        return ResponseEntity.ok(restaurant);

    }
}
