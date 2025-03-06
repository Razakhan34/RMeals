import React, { useEffect, useState } from "react";
import RouteMap from "./RouteMap";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getUsersOrdersAddress } from "../../../State/Customers/Orders/Action";

const TrackOrder = () => {
  const { id: orderId } = useParams();
  const { order, auth } = useSelector((store) => store);
  const dispatch = useDispatch();
  const jwt = localStorage.getItem("jwt");

  const [orderStatus, setOrderStatus] = useState(0);

  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);

  // Find Distance and Duration using MapBo API
  const getDistanceAndDuration = async (pickup, drop) => {
    const accessToken =
      "pk.eyJ1IjoicmF6YS13ZWJkZXYiLCJhIjoiY2xkMGlmd2Q3MTd3bzNydGcxamRuYnB0OCJ9.Tmj5M-Wwq6iF0H6V_JM4WA"; // Replace with your Mapbox access token
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${pickup[0]},${pickup[1]};${drop[0]},${drop[1]}?alternatives=true&geometries=geojson&steps=true&access_token=${accessToken}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.code === "Ok" && data.routes.length > 0) {
        const distance = data.routes[0].distance / 1000; // Convert to km
        const duration = data.routes[0].duration / 60; // Convert to minutes
        setDistance(distance.toFixed(2));
        setDuration(duration.toFixed(0));
      } else {
        console.error("No routes found:", data);
        return null;
      }
    } catch (error) {
      console.error("Error fetching directions:", error);
      return null;
    }
  };

  useEffect(() => {
    dispatch(getUsersOrdersAddress(jwt, orderId));
  }, [auth.jwt, dispatch, jwt, orderId]);

  useEffect(() => {
    if (order?.orderAddress?.order.orderStatus) {
      const statusMap = {
        PENDING: 0,
        SHIPPED: 1,
        OUT_FOR_DELIVERY: 2,
        DELIVERED: 3,
      };
      setOrderStatus(
        statusMap[order?.orderAddress?.order.orderStatus] + 1 || 0
      );
    }

    if (order?.orderAddress) {
      const pickupInfo = order?.orderAddress?.restaurantAddress;
      const dropInfo = order?.orderAddress?.deliveryAddress;
      const pickup = [pickupInfo.longitude, pickupInfo.latitude]; // Sample coordinates (New York Pickup)
      const drop = [dropInfo.longitude, dropInfo.latitude]; // Sample coordinates (New York Drop)
      getDistanceAndDuration(pickup, drop);
    }
  }, [order]);

  if (order.loading) return <h2>Loading...</h2>;
  if (!order.loading && !order?.orderAddress)
    return <h2>Could not fetch the order status, try again</h2>;

  const steps = ["Order Placed", "Shipped", "Out for Delivery", "Delivered"];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold text-blue-400 mb-6">
        Track Your Order
      </h1>
      <div className="bg-gray-800 shadow-lg rounded-xl w-11/12 max-w-4xl p-8">
        <div className="mb-8 h-80 bg-gray-700 rounded-lg flex items-center justify-center">
          <RouteMap
            pickupInformation={order?.orderAddress?.restaurantAddress}
            dropInformation={order?.orderAddress?.deliveryAddress}
          />
        </div>

        {/* Order Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Distance */}
          <div className="bg-gradient-to-r from-gray-700 to-gray-600 p-6 rounded-lg shadow-md text-center">
            <h2 className="text-lg font-semibold text-gray-300 mb-2">
              Total Distance
            </h2>
            <p className="text-2xl font-bold text-blue-400">{distance} km</p>
          </div>
          {/* Duration */}
          <div className="bg-gradient-to-r from-gray-700 to-gray-600 p-6 rounded-lg shadow-md text-center">
            <h2 className="text-lg font-semibold text-gray-300 mb-2">
              Estimated Duration
            </h2>
            <p className="text-2xl font-bold text-green-400">{duration} mins</p>
          </div>
        </div>

        {/* 🚀 Order Status Section */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-300 mb-6 text-center">
            Order Status
          </h3>

          <div className="relative flex items-center justify-between px-8">
            {/* ✅ Properly Centered Progress Line */}
            {/* <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 bg-gray-600 z-0">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(orderStatus / (steps.length - 1)) * 100}%`,
                  background: "linear-gradient(to right, #3b82f6, #22c55e)",
                  height: "6px",
                  left: "0",
                  position: "absolute",
                }}
              ></div>
            </div> */}

            {steps.map((step, index) => (
              <div
                key={index}
                className="relative flex-1 flex flex-col items-center z-10"
              >
                {/* 🎯 Step Circle (Now Perfectly Aligned with Progress Line) */}
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-full text-white font-bold text-lg transition-all duration-300 shadow-md ${
                    orderStatus > index
                      ? "bg-green-500 border-4 border-green-700"
                      : orderStatus === index
                      ? "bg-yellow-500 border-4 border-yellow-700 scale-110 animate-pulse"
                      : "bg-gray-600 border-4 border-gray-500"
                  }`}
                >
                  {index + 1}
                </div>

                {/* 🏷 Step Label */}
                <p
                  className={`mt-3 text-sm font-medium transition-all duration-300 ${
                    orderStatus >= index
                      ? "text-blue-400 font-semibold"
                      : "text-gray-400"
                  }`}
                >
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ℹ️ Additional Info */}
        <div className="mt-8 bg-gray-700 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-300">
            Additional Information
          </h3>
          <p className="text-gray-400 mt-3">
            Your order is on its way! Stay updated on its status and estimated
            arrival.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
