package com.raza.rmeals.repository;

import com.raza.rmeals.model.Food;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FoodRepository extends JpaRepository<Food, Long> {

    List<Food> findByRestaurantId(Long restaurantId);

//    @Query("SELECT f FROM Food f WHERE "
//            + "f.name LIKE %:keyword% OR "
//            + "f.foodCategory.name LIKE %:keyword% AND "
//            + "f.restaurant!=null"
//    )
    @Query("SELECT f FROM Food f WHERE "
            + "(LOWER(f.name) LIKE LOWER(CONCAT('%', :keyword, '%')) "
            + "OR LOWER(f.foodCategory.name) LIKE LOWER(CONCAT('%', :keyword, '%')) "
            + "OR LOWER(f.restaurant.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) "
            + "AND f.restaurant IS NOT NULL"
    )
    List<Food> searchByNameOrCategory(@Param("keyword") String keyword);

    @Query("SELECT f FROM Food f WHERE f.foodCategory.name IN :categories")
    List<Food> findByFoodCategoryIn(List<String> categories, Pageable pageable);

}
