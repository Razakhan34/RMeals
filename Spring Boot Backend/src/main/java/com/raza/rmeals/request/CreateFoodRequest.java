package com.raza.rmeals.request;

import com.raza.rmeals.model.Category;
import com.raza.rmeals.model.IngredientsItem;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateFoodRequest {

    private String name;
    private String description;
    private Long price;


//    private Long categoryId;
    private Category category;

    private List<String> images;


    private Long restaurantId;

    private boolean vegetarian;
    private boolean seasonal;


    private List<IngredientsItem> ingredients;
}
