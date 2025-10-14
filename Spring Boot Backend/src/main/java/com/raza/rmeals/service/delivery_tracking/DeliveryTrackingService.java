package com.raza.rmeals.service.delivery_tracking;

import com.raza.rmeals.model.DeliveryBoyLocation;

import java.time.LocalDateTime;
import java.util.List;

public interface DeliveryTrackingService {
    /**
     * Update delivery boy location
     * Stores in both Redis (fast) and MySQL (persistent)
     * Broadcasts to customer via WebSocket
     */
    DeliveryBoyLocation updateLocation(Long orderId, Long deliveryBoyId,
                                       Double latitude, Double longitude,
                                       String status, Double speed, Double heading);

    /**
     * Get current location for an order
     */
    DeliveryBoyLocation getCurrentLocation(Long orderId);

    /**
     * Get location history for an order
     */
    List<DeliveryBoyLocation> getLocationHistory(Long orderId);

    /**
     * Get location history within time range
     */
    List<DeliveryBoyLocation> getLocationHistoryInRange(Long orderId,
                                                        LocalDateTime startTime,
                                                        LocalDateTime endTime);

    /**
     * Calculate ETA based on current location and distance
     */
    Integer calculateETA(Long orderId, Double dropLatitude, Double dropLongitude);

    /**
     * Mark delivery as completed and clear Redis cache
     */
    void completeDelivery(Long orderId);

    /**
     * Cleanup old location records (scheduled task)
     */
    void cleanupOldLocations(int daysToKeep);
}
