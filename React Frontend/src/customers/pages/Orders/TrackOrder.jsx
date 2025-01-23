import React, { useEffect } from "react";
import RouteMap from "./RouteMap";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getUsersOrdersAddress } from "../../../State/Customers/Orders/Action";

const TrackOrder = () => {
  const { id: orderId } = useParams();
  const { order, auth } = useSelector((store) => store);
  const dispatch = useDispatch();
  const jwt = localStorage.getItem("jwt");

  console.log(order.loading);
  console.log(order.orderAddress);

  useEffect(() => {
    dispatch(getUsersOrdersAddress(jwt, orderId));
  }, [auth.jwt, dispatch, jwt, orderId]);

  if (order.loading) {
    return (
      <>
        <h2>Loading...</h2>
      </>
    );
  }

  if (order.loading === false && order?.orderAddress == null) {
    return (
      <>
        <h2>Could not fetch the order status , try again</h2>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-200 flex flex-col items-center py-10">
      {/* Header */}
      <h1 className="text-3xl font-extrabold text-blue-400 mb-8">
        Track Your Order
      </h1>

      {/* Container */}
      <div className="bg-gray-800 shadow-lg rounded-xl w-11/12 max-w-4xl p-8">
        {/* Route Map */}
        <div className="mb-8">
          <div className="h-80 bg-gray-700 rounded-lg flex items-center justify-center">
            <RouteMap
              pickupInformation={order?.orderAddress?.restaurantAddress}
              dropInformation={order?.orderAddress?.deliveryAddress}
            />
          </div>
        </div>

        {/* Order Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Distance */}
          <div className="bg-gradient-to-r from-gray-700 to-gray-600 p-6 rounded-lg shadow-md text-center">
            <h2 className="text-lg font-semibold text-gray-300 mb-2">
              Total Distance
            </h2>
            <p className="text-2xl font-bold text-blue-400">12.5 km</p>
          </div>
          {/* Duration */}
          <div className="bg-gradient-to-r from-gray-700 to-gray-600 p-6 rounded-lg shadow-md text-center">
            <h2 className="text-lg font-semibold text-gray-300 mb-2">
              Estimated Duration
            </h2>
            <p className="text-2xl font-bold text-green-400">25 mins</p>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-300 mb-4">
            Order Status
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center">
                1
              </div>
              <p className="mt-2 text-sm font-medium text-gray-400">
                Order Placed
              </p>
            </div>
            <div className="w-full h-1 bg-gray-600 mx-4">
              <div
                className="h-full bg-blue-500"
                style={{ width: "75%" }}
              ></div>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-gray-600 text-gray-300 w-8 h-8 rounded-full flex items-center justify-center">
                2
              </div>
              <p className="mt-2 text-sm font-medium text-gray-400">
                Out for Delivery
              </p>
            </div>
            <div className="w-full h-1 bg-gray-600 mx-4"></div>
            <div className="flex flex-col items-center">
              <div className="bg-gray-600 text-gray-300 w-8 h-8 rounded-full flex items-center justify-center">
                3
              </div>
              <p className="mt-2 text-sm font-medium text-gray-400">
                Delivered
              </p>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-gray-700 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-300">
            Additional Information
          </h3>
          <p className="text-gray-400 mt-3">
            Your order is on its way! Stay updated on its status and estimated
            arrival. We’re working hard to deliver it as fast as possible.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
