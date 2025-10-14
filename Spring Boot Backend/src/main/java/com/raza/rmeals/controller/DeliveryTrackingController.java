package com.raza.rmeals.controller;

import com.raza.rmeals.model.DeliveryBoyLocation;
import com.raza.rmeals.service.delivery_tracking.DeliveryTrackingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/delivery")
@CrossOrigin(origins = "*")
public class DeliveryTrackingController {
    private static final Logger logger = LoggerFactory.getLogger(DeliveryTrackingController.class);

    @Autowired
    private DeliveryTrackingService trackingService;

    /**
     * Delivery boy sends location update
     * Called every few seconds from delivery boy app
     */
    @PostMapping("/update-location")
    public ResponseEntity<Map<String, Object>> updateLocation(
            @RequestHeader("Authorization") String jwt,
            @RequestBody Map<String, Object> locationData) {

        try {
            System.out.println("Came here");
            logger.info("Incoming locationData: {}", locationData);
            Long orderId = Long.parseLong(locationData.get("orderId").toString());
            Long deliveryBoyId = Long.parseLong(locationData.get("deliveryBoyId").toString());
            Double latitude = Double.parseDouble(locationData.get("latitude").toString());
            Double longitude = Double.parseDouble(locationData.get("longitude").toString());
            String status = locationData.get("status").toString();
            Double speed = locationData.containsKey("speed") ?
                    Double.parseDouble(locationData.get("speed").toString()) : 0.0;
            Double heading = locationData.containsKey("heading") ?
                    Double.parseDouble(locationData.get("heading").toString()) : 0.0;

            logger.info("Received location update for Order: {}, DeliveryBoy: {}", orderId, deliveryBoyId);

            DeliveryBoyLocation location = trackingService.updateLocation(
                    orderId, deliveryBoyId, latitude, longitude, status, speed, heading
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Location updated successfully");
            response.put("location", location);

            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception e) {
            logger.error("Error updating location: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to update location: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Customer gets current delivery location
     * Fast retrieval from Redis
     */
    @GetMapping("/current-location/{orderId}")
    public ResponseEntity<DeliveryBoyLocation> getCurrentLocation(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Long orderId) {

        try {
            logger.info("Fetching current location for Order: {}", orderId);
            DeliveryBoyLocation location = trackingService.getCurrentLocation(orderId);

            if (location != null) {
                return new ResponseEntity<>(location, HttpStatus.OK);
            } else {
                logger.warn("No location found for Order: {}", orderId);
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error("Error fetching current location: ", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get location history for an order (for playback/analysis)
     */
    @GetMapping("/location-history/{orderId}")
    public ResponseEntity<List<DeliveryBoyLocation>> getLocationHistory(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Long orderId) {

        try {
            logger.info("Fetching location history for Order: {}", orderId);
            List<DeliveryBoyLocation> history = trackingService.getLocationHistory(orderId);
            return new ResponseEntity<>(history, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error fetching location history: ", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Calculate real-time ETA
     */
    @GetMapping("/eta/{orderId}")
    public ResponseEntity<Map<String, Object>> getETA(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Long orderId,
            @RequestParam Double dropLatitude,
            @RequestParam Double dropLongitude) {

        try {
            logger.info("Calculating ETA for Order: {}", orderId);
            Integer eta = trackingService.calculateETA(orderId, dropLatitude, dropLongitude);

            if (eta != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("eta", eta);
                response.put("unit", "minutes");
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                logger.warn("Cannot calculate ETA - no location for Order: {}", orderId);
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error("Error calculating ETA: ", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Mark delivery as completed
     */
    @PostMapping("/complete/{orderId}")
    public ResponseEntity<Map<String, Object>> completeDelivery(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Long orderId) {

        try {
            logger.info("Completing delivery for Order: {}", orderId);
            trackingService.completeDelivery(orderId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Delivery completed successfully");

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error completing delivery: ", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to complete delivery: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Delivery Tracking Service");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
