import React, { useEffect, useState } from "react";
import RouteMapRealtime from "./RouteMapRealtime";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getUsersOrdersAddress } from "../../../State/Customers/Orders/Action";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { CircularProgress, Chip, Box, Typography } from "@mui/material";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RoomIcon from "@mui/icons-material/Room";
import { API_URL } from "../../../config/api";
import { AppConstants } from "../../../config/constant";

const CustomerTrackOrder = () => {
  const { orderId } = useParams();
  const { order, auth } = useSelector((store) => store);
  const dispatch = useDispatch();
  const jwt = localStorage.getItem("jwt");

  const [orderStatus, setOrderStatus] = useState(0);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null);
  const [eta, setEta] = useState(null);
  const [stompClient, setStompClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const socket = new SockJS(`${API_URL}/ws-tracking`);
    const client = Stomp.over(socket);

    client.connect(
      {},
      () => {
        console.log("Customer WebSocket Connected");
        setIsConnected(true);

        // Subscribe to order-specific location updates
        client.subscribe(`/topic/order/${orderId}`, (message) => {
          const locationUpdate = JSON.parse(message.body);
          console.log("📍 Received location update:", locationUpdate);
          setDeliveryBoyLocation(locationUpdate);
          setLastUpdateTime(new Date());

          // Recalculate ETA when location changes
          if (order?.orderAddress?.deliveryAddress) {
            fetchETA();
          }
        });
      },
      (error) => {
        console.error("WebSocket connection error:", error);
        setIsConnected(false);
      }
    );

    setStompClient(client);

    return () => {
      if (client && client.connected) {
        client.disconnect();
      }
    };
  }, [orderId]);

  // Fetch initial delivery boy location from Redis/MySQL
  useEffect(() => {
    const fetchCurrentLocation = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/delivery/current-location/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setDeliveryBoyLocation(data);
          setLastUpdateTime(new Date());
        }
      } catch (error) {
        console.error("Error fetching current location:", error);
      }
    };

    fetchCurrentLocation();

    // Fallback polling every 10 seconds (if WebSocket fails)
    const interval = setInterval(fetchCurrentLocation, 10000);

    return () => clearInterval(interval);
  }, [orderId, jwt]);

  // Fetch ETA from backend
  const fetchETA = async () => {
    if (!order?.orderAddress?.deliveryAddress) return;

    try {
      const { latitude, longitude } = order.orderAddress.deliveryAddress;
      const response = await fetch(
        `${API_URL}/api/delivery/eta/${orderId}?dropLatitude=${latitude}&dropLongitude=${longitude}`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setEta(data.eta);
      }
    } catch (error) {
      console.error("Error fetching ETA:", error);
    }
  };

  // Calculate initial distance and duration using Mapbox
  const getDistanceAndDuration = async (pickup, drop) => {
    const accessToken = AppConstants.MAPBOX_ACCESS_TOKEN;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${pickup[0]},${pickup[1]};${drop[0]},${drop[1]}?alternatives=true&geometries=geojson&steps=true&access_token=${accessToken}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.code === "Ok" && data.routes.length > 0) {
        const distance = data.routes[0].distance / 1000;
        const duration = data.routes[0].duration / 60;
        setDistance(distance.toFixed(2));
        setDuration(duration.toFixed(0));
      }
    } catch (error) {
      console.error("Error fetching directions:", error);
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
      const pickup = [pickupInfo.longitude, pickupInfo.latitude];
      const drop = [dropInfo.longitude, dropInfo.latitude];
      getDistanceAndDuration(pickup, drop);
      fetchETA();
    }
  }, [order]);

  if (order.loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <CircularProgress size={60} />
      </div>
    );
  }

  if (!order.loading && !order?.orderAddress) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <h2 className="text-white text-xl">
          Could not fetch order status. Please try again.
        </h2>
      </div>
    );
  }

  const steps = ["Order Placed", "Shipped", "Out for Delivery", "Delivered"];

  const getStatusColor = (status) => {
    const colors = {
      ASSIGNED: "#f59e0b",
      PICKED_UP: "#3b82f6",
      IN_TRANSIT: "#8b5cf6",
      NEARBY: "#f97316",
      DELIVERED: "#10b981",
    };
    return colors[status] || "#6b7280";
  };

  const getStatusEmoji = (status) => {
    const emojis = {
      ASSIGNED: "🔔",
      PICKED_UP: "📦",
      IN_TRANSIT: "🚴",
      NEARBY: "📍",
      DELIVERED: "✅",
    };
    return emojis[status] || "📦";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-gray-200 flex flex-col items-center py-10 px-4">
      <h1 className="text-4xl font-bold text-blue-400 mb-6 flex items-center gap-3">
        <DirectionsBikeIcon sx={{ fontSize: "3rem" }} />
        Track Your Order
      </h1>

      {/* Connection Status */}
      <Box sx={{ mb: 4 }}>
        <Chip
          label={isConnected ? "● Live Tracking Active" : "● Reconnecting..."}
          color={isConnected ? "success" : "warning"}
          sx={{ fontSize: "0.9rem", py: 2.5, px: 1 }}
        />
        {lastUpdateTime && isConnected && (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              textAlign: "center",
              mt: 1,
              color: "#9ca3af",
            }}
          >
            Last update: {lastUpdateTime.toLocaleTimeString()}
          </Typography>
        )}
      </Box>

      <div className="bg-gray-800 shadow-2xl rounded-2xl w-11/12 max-w-6xl p-8">
        {/* Live Map */}
        <div className="mb-8 h-96 bg-gray-700 rounded-xl overflow-hidden shadow-inner border-4 border-blue-500/20">
          <RouteMapRealtime
            pickupInformation={order?.orderAddress?.restaurantAddress}
            dropInformation={order?.orderAddress?.deliveryAddress}
            deliveryBoyLocation={deliveryBoyLocation}
          />
        </div>

        {/* Delivery Status Banner */}
        {deliveryBoyLocation && (
          <Box
            sx={{
              mb: 4,
              p: 3,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${getStatusColor(
                deliveryBoyLocation.status
              )}22 0%, ${getStatusColor(deliveryBoyLocation.status)}44 100%)`,
              border: `2px solid ${getStatusColor(deliveryBoyLocation.status)}`,
              textAlign: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: "white", fontWeight: "bold", mb: 1 }}
            >
              {getStatusEmoji(deliveryBoyLocation.status)}{" "}
              {deliveryBoyLocation.status.replace(/_/g, " ")}
            </Typography>
            {deliveryBoyLocation.speed > 0 && (
              <Typography variant="body2" sx={{ color: "#d1d5db" }}>
                Moving at {deliveryBoyLocation.speed.toFixed(1)} km/h
              </Typography>
            )}
          </Box>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Distance */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-xl shadow-lg text-center transform hover:scale-105 transition-transform">
            <RoomIcon sx={{ fontSize: 40, mb: 1 }} />
            <h2 className="text-lg font-semibold text-blue-100 mb-2">
              Total Distance
            </h2>
            <p className="text-3xl font-bold text-white">{distance} km</p>
          </div>

          {/* Original Duration */}
          <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-xl shadow-lg text-center transform hover:scale-105 transition-transform">
            <AccessTimeIcon sx={{ fontSize: 40, mb: 1 }} />
            <h2 className="text-lg font-semibold text-green-100 mb-2">
              Est. Duration
            </h2>
            <p className="text-3xl font-bold text-white">{duration} mins</p>
          </div>

          {/* Live ETA */}
          <div className="bg-gradient-to-br from-orange-600 to-red-600 p-6 rounded-xl shadow-lg text-center transform hover:scale-105 transition-transform animate-pulse">
            <AccessTimeIcon sx={{ fontSize: 40, mb: 1 }} />
            <h2 className="text-lg font-semibold text-orange-100 mb-2">
              🔴 Live ETA
            </h2>
            <p className="text-3xl font-bold text-white">
              {eta ? `${eta} mins` : "Calculating..."}
            </p>
          </div>
        </div>

        {/* Order Status Timeline */}
        <div className="mt-10">
          <h3 className="text-2xl font-semibold text-gray-300 mb-8 text-center">
            Order Status
          </h3>

          <div className="relative flex items-center justify-between px-8">
            {/* Progress Line */}
            <div className="absolute top-6 left-0 right-0 h-2 bg-gray-600 rounded-full">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-in-out"
                style={{
                  width: `${(orderStatus / (steps.length - 1)) * 100}%`,
                  background: "linear-gradient(to right, #3b82f6, #10b981)",
                }}
              ></div>
            </div>

            {steps.map((step, index) => (
              <div
                key={index}
                className="relative flex-1 flex flex-col items-center z-10"
              >
                <div
                  className={`w-14 h-14 flex items-center justify-center rounded-full text-white font-bold text-xl transition-all duration-500 shadow-lg ${
                    orderStatus > index
                      ? "bg-green-500 border-4 border-green-700 scale-110"
                      : orderStatus === index
                      ? "bg-yellow-500 border-4 border-yellow-700 scale-125 animate-pulse"
                      : "bg-gray-600 border-4 border-gray-500"
                  }`}
                >
                  {orderStatus > index ? "✓" : index + 1}
                </div>

                <p
                  className={`mt-4 text-sm font-medium transition-all duration-300 ${
                    orderStatus >= index
                      ? "text-blue-300 font-bold"
                      : "text-gray-500"
                  }`}
                >
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-10 bg-gray-700/50 p-6 rounded-xl border border-gray-600">
          <h3 className="text-lg font-semibold text-gray-300 mb-3">
            📦 Delivery Information
          </h3>
          <p className="text-gray-400 leading-relaxed">
            Your order is being tracked in real-time. The delivery partner's
            location updates automatically every few seconds. You'll receive
            notifications as your order progresses through each stage.
          </p>
          {!isConnected && (
            <p className="text-yellow-400 mt-3 text-sm flex items-center gap-2">
              <span>⚠</span>
              <span>
                Live tracking temporarily unavailable. Attempting to
                reconnect...
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerTrackOrder;
