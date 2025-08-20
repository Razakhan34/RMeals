package com.raza.rmeals.request;

import java.time.LocalDateTime;
import java.util.List;

import com.raza.rmeals.model.Address;
import com.raza.rmeals.model.ContactInformation;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateRestaurantRequest {
  private String name;
  private String description;
  private String cuisineType;
  private Address address;
  private ContactInformation contactInformation;
  private String openingHours;
  private List<String> images;
  private LocalDateTime registrationDate;
}
