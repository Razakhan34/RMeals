// Actions.js

import { api } from "../../../config/api";
import {
  createRestaurantFailure,
  createRestaurantRequest,
  createRestaurantSuccess,
  deleteRestaurantFailure,
  deleteRestaurantRequest,
  deleteRestaurantSuccess,
  getAllRestaurantsFailure,
  getAllRestaurantsRequest,
  getAllRestaurantsSuccess,
  getNearbyRestaurantsFailure,
  getNearbyRestaurantsRequest,
  getNearbyRestaurantsSuccess,
  getRestaurantByIdFailure,
  getRestaurantByIdRequest,
  getRestaurantByIdSuccess,
  updateRestaurantFailure,
  updateRestaurantRequest,
  updateRestaurantSuccess,
} from "./ActionCreateros";

import {
  CREATE_CATEGORY_FAILURE,
  CREATE_CATEGORY_REQUEST,
  CREATE_CATEGORY_SUCCESS,
  CREATE_EVENTS_FAILURE,
  CREATE_EVENTS_REQUEST,
  CREATE_EVENTS_SUCCESS,
  DELETE_EVENTS_FAILURE,
  DELETE_EVENTS_REQUEST,
  DELETE_EVENTS_SUCCESS,
  GET_ALL_EVENTS_FAILURE,
  GET_ALL_EVENTS_REQUEST,
  GET_ALL_EVENTS_SUCCESS,
  GET_RESTAIRANTS_EVENTS_FAILURE,
  GET_RESTAIRANTS_EVENTS_REQUEST,
  GET_RESTAIRANTS_EVENTS_SUCCESS,
  GET_RESTAURANTS_CATEGORY_FAILURE,
  GET_RESTAURANTS_CATEGORY_REQUEST,
  GET_RESTAURANTS_CATEGORY_SUCCESS,
  GET_RESTAURANT_BY_USER_ID_FAILURE,
  GET_RESTAURANT_BY_USER_ID_REQUEST,
  GET_RESTAURANT_BY_USER_ID_SUCCESS,
  UPDATE_RESTAURANT_STATUS_FAILURE,
  UPDATE_RESTAURANT_STATUS_REQUEST,
  UPDATE_RESTAURANT_STATUS_SUCCESS,
} from "./ActionTypes";

export const getAllRestaurantsAction = (token) => {
  return async (dispatch) => {
    dispatch(getAllRestaurantsRequest());
    try {
      const { data } = await api.get("/api/restaurants", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(getAllRestaurantsSuccess(data));
    } catch (error) {
      dispatch(getAllRestaurantsFailure(error));
    }
  };
};

export const getRestaurantById = (reqData) => {
  return async (dispatch) => {
    dispatch(getRestaurantByIdRequest());
    try {
      const response = await api.get(
        `api/restaurants/${reqData.restaurantId}`,
        {
          headers: {
            Authorization: `Bearer ${reqData.jwt}`,
          },
        }
      );
      dispatch(getRestaurantByIdSuccess(response.data));
    } catch (error) {
      console.log("error", error);
      dispatch(getRestaurantByIdFailure(error));
    }
  };
};

// 🏠 Fetch nearby restaurants
export const getNearbyRestaurants = (jwt) => {
  return async (dispatch) => {
    dispatch(getNearbyRestaurantsRequest());
    try {
      const response = await api.get(`api/restaurants/nearby-restaurants`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      dispatch(getNearbyRestaurantsSuccess(response.data));
    } catch (error) {
      dispatch(getNearbyRestaurantsFailure(error));
    }
  };

  // this  will be used later when i will integrate nearby restaurant with latitude and longitude
  // const response = await api.get(
  //   `/api/restaurant/nearby-restaurant?latitude=${latitude}&longitude=${longitude}&radiusKm=5`,
  //   {
  //     headers: {
  //       Authorization: `Bearer ${jwt}`,
  //     },
  //   }
  // );
};

export const getRestaurantByUserId = (jwt) => {
  return async (dispatch) => {
    dispatch({ type: GET_RESTAURANT_BY_USER_ID_REQUEST });
    try {
      const { data } = await api.get(`/api/admin/restaurants/user`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      console.log("get restaurant by user id ", data);
      dispatch({ type: GET_RESTAURANT_BY_USER_ID_SUCCESS, payload: data });
    } catch (error) {
      console.log("catch error ", error);
      dispatch({
        type: GET_RESTAURANT_BY_USER_ID_FAILURE,
        payload: error.message,
      });
    }
  };
};

export const createRestaurant = ({ formData, token }) => {
  console.log("token-----------", token);
  console.log("formData-----------", formData);
  return async (dispatch) => {
    dispatch(createRestaurantRequest());
    try {
      const { data } = await api.post(`/api/admin/restaurants`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(createRestaurantSuccess(data));
      console.log("created restaurant ", data);
    } catch (error) {
      console.log("catch error ", error);
      dispatch(createRestaurantFailure(error));
    }
  };
};

export const updateRestaurant = ({ restaurantId, restaurantData, jwt }) => {
  return async (dispatch) => {
    dispatch(updateRestaurantRequest());

    try {
      const res = await api.put(
        `api/admin/restaurant/${restaurantId}`,
        restaurantData,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      dispatch(updateRestaurantSuccess(res.data));
    } catch (error) {
      dispatch(updateRestaurantFailure(error));
    }
  };
};
export const deleteRestaurant = ({ restaurantId, jwt }) => {
  return async (dispatch) => {
    dispatch(deleteRestaurantRequest());

    try {
      const res = await api.delete(`/api/admin/restaurant/${restaurantId}`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      console.log("delete restaurant ", res.data);
      dispatch(deleteRestaurantSuccess(restaurantId));
    } catch (error) {
      console.log("catch error ", error);
      dispatch(deleteRestaurantFailure(error));
    }
  };
};

export const updateRestaurantStatus = ({ restaurantId, jwt }) => {
  return async (dispatch) => {
    dispatch({ type: UPDATE_RESTAURANT_STATUS_REQUEST });

    try {
      const res = await api.put(
        `api/admin/restaurants/${restaurantId}/status`,
        {},
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      console.log("ressssss ", res.data);
      dispatch({ type: UPDATE_RESTAURANT_STATUS_SUCCESS, payload: res.data });
    } catch (error) {
      console.log("error ", error);
      dispatch({ type: UPDATE_RESTAURANT_STATUS_FAILURE, payload: error });
    }
  };
};

export const createEventAction = ({ data, jwt, restaurantId }) => {
  return async (dispatch) => {
    dispatch({ type: CREATE_EVENTS_REQUEST });

    try {
      const res = await api.post(
        `api/admin/events/restaurant/${restaurantId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      console.log("create events ", res.data);
      dispatch({ type: CREATE_EVENTS_SUCCESS, payload: res.data });
    } catch (error) {
      console.log("catch - ", error);
      dispatch({ type: CREATE_EVENTS_FAILURE, payload: error });
    }
  };
};

export const getAllEvents = ({ jwt }) => {
  return async (dispatch) => {
    dispatch({ type: GET_ALL_EVENTS_REQUEST });

    try {
      const res = await api.get(`api/events`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      console.log("get all events ", res.data);
      dispatch({ type: GET_ALL_EVENTS_SUCCESS, payload: res.data });
    } catch (error) {
      dispatch({ type: GET_ALL_EVENTS_FAILURE, payload: error });
    }
  };
};

export const deleteEventAction = ({ eventId, jwt }) => {
  return async (dispatch) => {
    dispatch({ type: DELETE_EVENTS_REQUEST });

    try {
      const res = await api.delete(`api/admin/events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      console.log("DELETE events ", res.data);
      dispatch({ type: DELETE_EVENTS_SUCCESS, payload: eventId });
    } catch (error) {
      console.log("catch - ", error);
      dispatch({ type: DELETE_EVENTS_FAILURE, payload: error });
    }
  };
};

export const getRestaurnatsEvents = ({ restaurantId, jwt }) => {
  return async (dispatch) => {
    dispatch({ type: GET_RESTAIRANTS_EVENTS_REQUEST });

    try {
      const res = await api.get(
        `/api/admin/events/restaurant/${restaurantId}`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      console.log("get restaurants event ", res.data);
      dispatch({ type: GET_RESTAIRANTS_EVENTS_SUCCESS, payload: res.data });
    } catch (error) {
      dispatch({ type: GET_RESTAIRANTS_EVENTS_FAILURE, payload: error });
    }
  };
};

export const createCategoryAction = ({ reqData, jwt }) => {
  return async (dispatch) => {
    dispatch({ type: CREATE_CATEGORY_REQUEST });

    try {
      const res = await api.post(`api/admin/category`, reqData, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      console.log("create category ", res.data);
      dispatch({ type: CREATE_CATEGORY_SUCCESS, payload: res.data });
    } catch (error) {
      console.log("catch - ", error);
      dispatch({ type: CREATE_CATEGORY_FAILURE, payload: error });
    }
  };
};

export const getRestaurantsCategory = ({ jwt, restaurantId }) => {
  return async (dispatch) => {
    dispatch({ type: GET_RESTAURANTS_CATEGORY_REQUEST });
    try {
      const res = await api.get(`/api/category/restaurant/${restaurantId}`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      console.log("get restaurants category ", res.data);
      dispatch({ type: GET_RESTAURANTS_CATEGORY_SUCCESS, payload: res.data });
    } catch (error) {
      dispatch({ type: GET_RESTAURANTS_CATEGORY_FAILURE, payload: error });
    }
  };
};
