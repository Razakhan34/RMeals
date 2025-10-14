package com.raza.rmeals.service.delivery_tracking;

import com.raza.rmeals.model.DeliveryBoyLocation;

public interface RedisLocationService {
    /**
     * Save current location to Redis (by order ID)
     */
    void saveLocationByOrderId(Long orderId, DeliveryBoyLocation location);

    /**
     * Get current location from Redis (by order ID)
     */
    DeliveryBoyLocation getLocationByOrderId(Long orderId);

    /**
     * Save current location to Redis (by delivery boy ID)
     */
    void saveLocationByDeliveryBoyId(Long deliveryBoyId, DeliveryBoyLocation location);

    /**
     * Get current location from Redis (by delivery boy ID)
     */
    DeliveryBoyLocation getLocationByDeliveryBoyId(Long deliveryBoyId);

    /**
     * Delete location from Redis
     */
    void deleteLocationByOrderId(Long orderId);

    /**
     * Check if location exists in Redis
     */
    boolean hasLocationByOrderId(Long orderId);

    /**
     * Update location TTL (extend expiration)
     */
    void extendLocationTTL(Long orderId, long minutes);
}
