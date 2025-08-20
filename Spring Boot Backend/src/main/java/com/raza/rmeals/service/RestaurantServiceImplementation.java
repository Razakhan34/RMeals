package com.raza.rmeals.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.raza.rmeals.dto.RestaurantDto;
import com.raza.rmeals.exception.RestaurantException;
import com.raza.rmeals.model.Address;
import com.raza.rmeals.model.Restaurant;
import com.raza.rmeals.model.User;
import com.raza.rmeals.repository.AddressRepository;
import com.raza.rmeals.repository.RestaurantRepository;
import com.raza.rmeals.repository.UserRepository;
import com.raza.rmeals.request.CreateRestaurantRequest;

@Service
public class RestaurantServiceImplementation implements RestaurantService {

  @Autowired
  private RestaurantRepository restaurantRepository;

  @Autowired
  private AddressRepository addressRepository;

  @Autowired
  private UserService userService;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private FileUploadS3Service fileUploadS3Service;

  @Override
  public Restaurant createRestaurant(CreateRestaurantRequest req, User user) {
    Address savedAddress =  savedAddress(req);

    Restaurant restaurant = new Restaurant();

    restaurant.setAddress(savedAddress);
    restaurant.setContactInformation(req.getContactInformation());
    restaurant.setCuisineType(req.getCuisineType());
    restaurant.setDescription(req.getDescription());
    restaurant.setImages(req.getImages());
    restaurant.setName(req.getName());
    restaurant.setOpeningHours(req.getOpeningHours());
    restaurant.setRegistrationDate(req.getRegistrationDate());
    restaurant.setOwner(user);
    Restaurant savedRestaurant = restaurantRepository.save(restaurant);

    return savedRestaurant;
  }

  @Override
  public Restaurant updateRestaurant(Long restaurantId, CreateRestaurantRequest updatedReq)
          throws RestaurantException {
    Restaurant restaurant = findRestaurantById(restaurantId);
    if (updatedReq.getCuisineType() != null) {
      restaurant.setCuisineType(updatedReq.getCuisineType());
    }
    if (updatedReq.getDescription() != null) {
      restaurant.setDescription(updatedReq.getDescription());
    }
    if (updatedReq.getName() != null) {
      restaurant.setName(updatedReq.getName());
    }
    if(updatedReq.getImages() != null) {
      restaurant.setImages(updatedReq.getImages());
    }
    if(updatedReq.getAddress() != null) {
      Address savedAddress = savedAddress(updatedReq);
      restaurant.setAddress(savedAddress);
    }
    if(updatedReq.getContactInformation() != null) {
      restaurant.setContactInformation(updatedReq.getContactInformation());
    }
    return restaurantRepository.save(restaurant);
  }

  private Address savedAddress(CreateRestaurantRequest req) {
    Address address = new Address();
    address.setCity(req.getAddress().getCity());
    address.setCountry(req.getAddress().getCountry());
    address.setFullName(req.getAddress().getFullName());
    address.setPostalCode(req.getAddress().getPostalCode());
    address.setState(req.getAddress().getState());
    address.setStreetAddress(req.getAddress().getStreetAddress());
    address.setLatitude(req.getAddress().getLatitude());
    address.setLongitude(req.getAddress().getLongitude());
    return addressRepository.save(address);
  }

  @Override
  public void deleteRestaurant(Long restaurantId) throws RestaurantException {
    Restaurant restaurant = findRestaurantById(restaurantId);
    if (restaurant != null) {
      // Delete all images from S3 before removing restaurant
      if (restaurant.getImages() != null && !restaurant.getImages().isEmpty()) {
        for (String imgUrl : restaurant.getImages()) {
          try {
            fileUploadS3Service.deleteFile(imgUrl);
          } catch (Exception e) {
            // Log the error but don't stop deletion
            System.err.println("Failed to delete image from S3: " + imgUrl + " error: " + e.getMessage());
          }
        }
      }
      restaurantRepository.delete(restaurant);
      return;
    }
    throw new RestaurantException("Restaurant with id " + restaurantId + " Not found");

  }



  @Override
  public Restaurant findRestaurantById(Long restaurantId) throws RestaurantException {
    Optional<Restaurant> restaurant = restaurantRepository.findById(restaurantId);
    if (restaurant.isPresent()) {
      return restaurant.get();
    } else {
      throw new RestaurantException("Restaurant with id " + restaurantId + "not found");
    }
  }

  @Override
  public List<Restaurant> getAllRestaurant() {
    return restaurantRepository.findAll();
  }


  @Override
  public Restaurant getRestaurantsByUserId(Long userId) throws RestaurantException {
    Restaurant restaurants = restaurantRepository.findByOwnerId(userId);
    return restaurants;
  }



  @Override
  public List<Restaurant> searchRestaurant(String keyword) {
    return restaurantRepository.findBySearchQuery(keyword);
  }

  @Override
  public RestaurantDto addToFavorites(Long restaurantId,User user) throws RestaurantException {
    Restaurant restaurant=findRestaurantById(restaurantId);

    RestaurantDto dto=new RestaurantDto();
    dto.setTitle(restaurant.getName());
    dto.setImages(restaurant.getImages());
    dto.setId(restaurant.getId());
    dto.setDescription(restaurant.getDescription());

    boolean isFavorite = false;
    List<RestaurantDto> favorites = user.getFavorites();
    for (RestaurantDto favorite : favorites) {
      if (favorite.getId().equals(restaurantId)) {
        isFavorite = true;
        break;
      }
    }

    if (isFavorite) {
      favorites.removeIf(favorite -> favorite.getId().equals(restaurantId));
    } else {
      favorites.add(dto);
    }

    User updatedUser = userRepository.save(user);
    return dto;
  }

  @Override
  public Restaurant updateRestaurantStatus(Long id) throws RestaurantException {
    Restaurant restaurant=findRestaurantById(id);
    restaurant.setOpen(!restaurant.isOpen());
    return restaurantRepository.save(restaurant);
  }

}
