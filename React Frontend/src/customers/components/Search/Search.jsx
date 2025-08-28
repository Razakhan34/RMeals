import React, { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import { PopularCuisines } from "./PopularCuisines";
import SearchDishCard from "./SearchDishCard";
import { useDispatch, useSelector } from "react-redux";
import {
  searchMenuItem,
  searchPopularCuisinesMenuItem,
} from "../../../State/Customers/Menu/menu.action";
import { getNearbyRestaurants } from "../../../State/Customers/Restaurant/restaurant.action";
import NearbyRestaurantCard from "./NearbyRestaurantCard";

const Search = () => {
  const dispatch = useDispatch();
  const {
    menu,
    auth,
    restaurant: { nearbyRestaurants },
  } = useSelector((store) => store);

  const { loading: loadingFood } = useSelector((store) => store.menu);
  const { loading: loadingRestaurant } = useSelector(
    (store) => store.restaurant
  );
  const jwt = localStorage.getItem("jwt");

  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchMenu = (keyword) => {
    setSearchTerm(keyword);
    // console.log(keyword);
    // console.log(menu);
    if (keyword.trim().length > 0) {
      dispatch(searchMenuItem({ keyword, jwt: auth.jwt || jwt }));
    }
  };

  // Fetch nearby restaurants initially (when searchTerm is empty)
  useEffect(() => {
    if (searchTerm.trim() === "") {
      // navigator.geolocation.getCurrentPosition((position) => {
      //   const { latitude, longitude } = position.coords;
      //   dispatch(getNearbyRestaurants({ latitude, longitude, jwt: auth.jwt || jwt }));
      // });
      dispatch(getNearbyRestaurants(jwt || auth.jwt));
      dispatch(searchPopularCuisinesMenuItem(jwt || auth.jwt));
    }
  }, [searchTerm, dispatch, auth.jwt, jwt]);

  return (
    <div className="px-5 lg:px-[18vw]">
      {/* Search Bar */}
      <div className="relative py-5">
        <SearchIcon className="absolute top-[2rem] left-2 text-gray-400" />
        <input
          value={searchTerm}
          onChange={(e) => handleSearchMenu(e.target.value)}
          className="p-2 py-3 pl-12 w-full bg-[#242B2E] text-white rounded-sm outline-none"
          type="text"
          placeholder="Search food..."
        />
      </div>

      {/* Popular Cuisines */}
      <div>
        <h1 className="py-5 text-2xl font-semibold">Popular Cuisines</h1>
        <div className="flex flex-wrap">
          {loadingFood ? (
            <div>Loading popular cuisines...</div>
          ) : (
            menu.popularCuisines.map((item, index) => (
              <PopularCuisines key={index} dish={item} />
            ))
          )}
          {/* {topMeels.slice(0, 9).map((item, index) => (
            <PopularCuisines
              key={index}
              image={item.image}
              title={item.title}
            />
          ))} */}
        </div>
      </div>

      {/* Search Results Section */}
      <div className="mt-7">
        {/* Case 1: No search yet -> show nearby/popular */}
        {searchTerm.trim() === "" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Restaurants Near You</h2>
            <div className="flex flex-wrap gap-4">
              {loadingRestaurant ? (
                <div>Loading nearby restaurants...</div>
              ) : (
                nearbyRestaurants.map((restaurant, index) => (
                  <NearbyRestaurantCard key={index} restaurant={restaurant} />
                ))
              )}
            </div>
          </div>
        )}

        {/* Case 2: User typed but no results */}
        {searchTerm.trim() !== "" && menu.search.length === 0 && (
          <div className="flex flex-col items-center justify-center bg-[#242B2E] text-white rounded-md p-10 shadow-lg">
            <SentimentDissatisfiedIcon
              style={{ fontSize: "3rem", color: "#FF6B6B" }}
            />
            <h2 className="text-xl font-bold mt-3">No Results Found</h2>
            <p className="text-gray-300 mt-2 text-center max-w-md">
              We couldn’t find any matches for “
              <span className="text-[#5BC0BE]">{searchTerm}</span>”. Try another{" "}
              <span className="text-[#5BC0BE]">dish</span> or{" "}
              <span className="text-[#5BC0BE]">restaurant</span>.
            </p>
          </div>
        )}

        {/* Case 3: User typed & results found */}
        {searchTerm.trim() !== "" &&
          menu.search?.length > 0 &&
          menu.search.map((item, index) => (
            <SearchDishCard key={index} item={item} />
          ))}
      </div>
    </div>
  );
};

export default Search;
