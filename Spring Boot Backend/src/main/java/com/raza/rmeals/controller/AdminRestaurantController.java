package com.raza.rmeals.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.raza.rmeals.exception.RestaurantException;
import com.raza.rmeals.exception.UserException;
import com.raza.rmeals.model.Restaurant;
import com.raza.rmeals.model.User;
import com.raza.rmeals.request.CreateRestaurantRequest;
import com.raza.rmeals.response.ApiResponse;
import com.raza.rmeals.service.FileUploadS3Service;
import com.raza.rmeals.service.RestaurantService;
import com.raza.rmeals.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/admin/restaurants")
@RequiredArgsConstructor
public class AdminRestaurantController {

    @Autowired
    private RestaurantService restaurantService;


    @Autowired
    private UserService userService;

    @Autowired
    private FileUploadS3Service fileUploadS3Service;

//    creating new restaurant
//    @PostMapping()
//    public ResponseEntity<Restaurant> createRestaurant(
//            @RequestBody CreateRestaurantRequest req,
//            @RequestHeader("Authorization") String jwt) throws UserException {
//        System.out.println("Creating Restaurant..");
//        User user = userService.findUserProfileByJwt(jwt);
//        Restaurant restaurant = restaurantService.createRestaurant(req, user);
//        return ResponseEntity.ok(restaurant);
//    }

    @PostMapping()
    public ResponseEntity<Restaurant> createRestaurant(
            @RequestPart("restaurant") String restaurantData, // raw JSON string
            @RequestPart(value = "images", required = false) MultipartFile[] resImages,
            @RequestHeader("Authorization") String jwt) throws Exception {

        User user = userService.findUserProfileByJwt(jwt);

        // Convert JSON string to object
        ObjectMapper objectMapper = new ObjectMapper();
        CreateRestaurantRequest req = objectMapper.readValue(restaurantData, CreateRestaurantRequest.class);

        // Upload images to S3
        List<String> imageUrls = new ArrayList<>();
        if (resImages != null) {
            for (MultipartFile file : resImages) {
                System.out.println(file.getOriginalFilename() + "uploaded successfully");
                String url = fileUploadS3Service.uploadFile(file);
                imageUrls.add(url);
            }
        }
        req.setImages(imageUrls);

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
