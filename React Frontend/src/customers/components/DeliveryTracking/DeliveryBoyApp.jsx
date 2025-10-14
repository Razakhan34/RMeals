import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Box,
  Chip,
  LinearProgress,
} from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import SpeedIcon from "@mui/icons-material/Speed";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { API_URL } from "../../../config/api";

const DeliveryBoyApp = ({ orderId, deliveryBoyId }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [status, setStatus] = useState("PICKED_UP");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [stompClient, setStompClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);

  const jwt = localStorage.getItem("jwt");
  const locationUpdateInterval = useRef(null);

  // WebSocket connection
  useEffect(() => {
    const socket = new SockJS(`${API_URL}/ws-delivery`);
    const client = Stomp.over(socket);

    client.connect(
      {},
      () => {
        console.log("Delivery Boy WebSocket Connected");
        setIsConnected(true);
        setSuccess("Connected to tracking system");
      },
      (error) => {
        console.error("WebSocket connection error:", error);
        setIsConnected(false);
        setError("Failed to connect to tracking system");
      }
    );

    setStompClient(client);

    return () => {
      if (client && client.connected) {
        client.disconnect();
      }
    };
  }, []);

  // Send location update to backend
  const sendLocationUpdate = async (latitude, longitude, speed, heading) => {
    try {
      console.log("Sending location update:", {
        latitude,
        longitude,
        status,
        speed,
        heading,
      });

      const response = await fetch(`${API_URL}/api/delivery/update-location`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          orderId: orderId | 1102,
          deliveryBoyId: deliveryBoyId || 1,
          latitude: latitude,
          longitude: longitude,
          status: status,
          speed: speed || 0,
          heading: heading || 0,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update location");
      }

      const data = await response.json();
      console.log("Location updated:", data);
      setUpdateCount((prev) => prev + 1);
      setSuccess(`Location updated successfully (${updateCount + 1} updates)`);

      // Clear success message after 2 seconds
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      console.error("Error sending location:", err);
      setError("Failed to update location: " + err.message);
    }
  };

  // Start tracking location
  const startTracking = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setError(null);
    setIsTracking(true);
    setUpdateCount(0);

    // Watch position with high accuracy
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed, heading } = position.coords;

        const locationData = {
          latitude,
          longitude,
          speed: speed ? speed * 3.6 : 0, // Convert m/s to km/h
          heading: heading || 0,
          timestamp: new Date().toISOString(),
        };

        console.log("New position:", locationData);

        setCurrentLocation(locationData);

        // Send location update immediately
        sendLocationUpdate(
          latitude,
          longitude,
          locationData.speed,
          locationData.heading
        );
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError(`Location Error: ${err.message}`);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );

    setWatchId(id);

    // Also send updates every 5 seconds (backup)
    locationUpdateInterval.current = setInterval(() => {
      if (currentLocation) {
        sendLocationUpdate(
          currentLocation.latitude,
          currentLocation.longitude,
          currentLocation.speed,
          currentLocation.heading
        );
      }
    }, 10000);
  };

  // Stop tracking location
  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }

    if (locationUpdateInterval.current) {
      clearInterval(locationUpdateInterval.current);
      locationUpdateInterval.current = null;
    }

    setIsTracking(false);
    setSuccess("Tracking stopped");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (locationUpdateInterval.current) {
        clearInterval(locationUpdateInterval.current);
      }
    };
  }, [watchId]);

  // Handle status change
  const handleStatusChange = (event) => {
    const newStatus = event.target.value;
    setStatus(newStatus);

    // Send immediate update with new status
    if (currentLocation && isTracking) {
      console.log("Status Changes, sending immediate update:", newStatus);
      sendLocationUpdate(
        currentLocation.latitude,
        currentLocation.longitude,
        currentLocation.speed,
        currentLocation.heading
      );
    }

    // Auto-stop tracking if delivered
    if (newStatus === "DELIVERED") {
      setTimeout(() => {
        stopTracking();
        // Call complete delivery API
        completeDelivery();
      }, 2000);
    }
  };

  // Complete delivery
  const completeDelivery = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/delivery/complete/${orderId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      if (response.ok) {
        setSuccess("Delivery completed successfully!");
      }
    } catch (err) {
      console.error("Error completing delivery:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <Card
        sx={{
          maxWidth: 550,
          width: "100%",
          backgroundColor: "#1f2937",
          color: "white",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <DirectionsBikeIcon
              sx={{ fontSize: 48, color: "#3b82f6", mb: 2 }}
            />
            <Typography
              variant="h4"
              component="div"
              sx={{ fontWeight: "bold", mb: 1 }}
            >
              Delivery Tracker
            </Typography>
            <Typography variant="body2" sx={{ color: "#9ca3af" }}>
              Real-time location sharing
            </Typography>
          </Box>

          {/* Connection Status */}
          <Box sx={{ mb: 3, textAlign: "center" }}>
            <Chip
              label={isConnected ? "● Connected" : "● Disconnected"}
              color={isConnected ? "success" : "error"}
              size="small"
            />
          </Box>

          {/* Order Info */}
          <Box sx={{ mb: 3, p: 3, bgcolor: "#374151", borderRadius: 2 }}>
            <Typography
              variant="body2"
              sx={{ mb: 1.5, display: "flex", justifyContent: "space-between" }}
            >
              <strong>Order ID:</strong>
              <span style={{ color: "#60a5fa" }}>{orderId}</span>
            </Typography>
            <Typography
              variant="body2"
              sx={{ display: "flex", justifyContent: "space-between" }}
            >
              <strong>Delivery Boy ID:</strong>
              <span style={{ color: "#60a5fa" }}>{deliveryBoyId}</span>
            </Typography>
          </Box>

          {/* Status Selector */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel sx={{ color: "white" }}>Delivery Status</InputLabel>
            <Select
              value={status}
              label="Delivery Status"
              onChange={handleStatusChange}
              disabled={!isTracking}
              sx={{
                color: "white",
                ".MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255, 255, 255, 0.3)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255, 255, 255, 0.5)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#3b82f6",
                },
              }}
            >
              <MenuItem value="ASSIGNED">🔔 Assigned</MenuItem>
              <MenuItem value="PICKED_UP">📦 Picked Up</MenuItem>
              <MenuItem value="IN_TRANSIT">🚴 In Transit</MenuItem>
              <MenuItem value="NEARBY">📍 Nearby (5 mins)</MenuItem>
              <MenuItem value="DELIVERED">✅ Delivered</MenuItem>
            </Select>
          </FormControl>

          {/* Current Location Display */}
          {currentLocation && (
            <Box sx={{ mb: 3, p: 3, bgcolor: "#065f46", borderRadius: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  mb: 2,
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <MyLocationIcon sx={{ fontSize: 20 }} />
                Current Location
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontSize: "0.875rem", mb: 0.5 }}
              >
                📍 Lat: {currentLocation.latitude.toFixed(6)}
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontSize: "0.875rem", mb: 0.5 }}
              >
                📍 Lng: {currentLocation.longitude.toFixed(6)}
              </Typography>
              {currentLocation.speed > 0 && (
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "0.875rem",
                    mt: 1.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <SpeedIcon sx={{ fontSize: 18 }} />
                  Speed: {currentLocation.speed.toFixed(1)} km/h
                </Typography>
              )}
              <Typography
                variant="caption"
                sx={{ display: "block", mt: 1.5, color: "#d1fae5" }}
              >
                Updates sent: {updateCount}
              </Typography>
            </Box>
          )}

          {/* Success Message */}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Tracking Status */}
          {isTracking && (
            <Box sx={{ mb: 3 }}>
              <Alert severity="info" sx={{ mb: 1 }}>
                <strong>🔴 Live Tracking Active</strong> - Location updates
                every 5 seconds
              </Alert>
              <LinearProgress />
            </Box>
          )}

          {/* Control Buttons */}
          <Box sx={{ display: "flex", gap: 2 }}>
            {!isTracking ? (
              <Button
                variant="contained"
                fullWidth
                onClick={startTracking}
                startIcon={<MyLocationIcon />}
                sx={{
                  py: 1.5,
                  bgcolor: "#10b981",
                  "&:hover": { bgcolor: "#059669" },
                  fontWeight: "bold",
                  fontSize: "1rem",
                }}
              >
                Start Tracking
              </Button>
            ) : (
              <Button
                variant="contained"
                fullWidth
                onClick={stopTracking}
                sx={{
                  py: 1.5,
                  bgcolor: "#ef4444",
                  "&:hover": { bgcolor: "#dc2626" },
                  fontWeight: "bold",
                  fontSize: "1rem",
                }}
              >
                Stop Tracking
              </Button>
            )}
          </Box>

          {/* Instructions */}
          <Box sx={{ mt: 4, p: 3, bgcolor: "#374151", borderRadius: 2 }}>
            <Typography
              variant="body2"
              sx={{ color: "#d1d5db", fontSize: "0.875rem" }}
            >
              <strong>📋 Instructions:</strong>
              <ul
                style={{
                  marginTop: "12px",
                  marginLeft: "16px",
                  lineHeight: 1.8,
                }}
              >
                <li>Click "Start Tracking" to share your location</li>
                <li>Update delivery status as you progress</li>
                <li>Your location updates automatically every 5 seconds</li>
                <li>Customers see your live location on their map</li>
                <li>Mark as "Delivered" when order is complete</li>
              </ul>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryBoyApp;
