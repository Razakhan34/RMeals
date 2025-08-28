import React from "react";
import { useNavigate } from "react-router-dom";

export const PopularCuisines = ({ dish }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(
      `/restaurant/${dish.restaurant.address.city}/${dish.restaurant.name}/${dish.restaurant.id}`
    );
  };

  return (
    <div
      onClick={handleClick}
      className="px-3 flex flex-col justify-center items-center cursor-pointer hover:scale-105 transition-transform duration-200"
    >
      {/* Cuisine / Dish Image */}
      <img
        className="w-[3rem] h-[3rem] lg:w-[5rem] lg:h-[5rem] rounded-full object-cover object-center shadow-md"
        src={dish.images[0]}
        alt={dish.foodCategory.name}
      />

      {/* Cuisine Title */}
      <span className="py-2 font-semibold text-xs text-gray-600 text-center">
        {dish.foodCategory.name.length > 6
          ? dish.foodCategory.name.substring(0, 5) + "..."
          : dish.foodCategory.name}
      </span>
    </div>
  );
};
