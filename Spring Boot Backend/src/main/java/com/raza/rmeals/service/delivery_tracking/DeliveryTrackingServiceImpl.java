package com.raza.rmeals.service.delivery_tracking;

import com.raza.rmeals.model.DeliveryBoyLocation;
import com.raza.rmeals.repository.DeliveryBoyLocationRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DeliveryTrackingServiceImpl implements DeliveryTrackingService {
    private static final Logger logger = LoggerFactory.getLogger(DeliveryTrackingServiceImpl.class);

    @Autowired
    private DeliveryBoyLocationRepository locationRepository;

    @Autowired
    private RedisLocationService redisLocationService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public DeliveryBoyLocation updateLocation(Long orderId, Long deliveryBoyId,
                                              Double latitude, Double longitude,
                                              String status, Double speed, Double heading) {

        logger.info("Updating location for Order: {}, DeliveryBoy: {}", orderId, deliveryBoyId);

        DeliveryBoyLocation location = new DeliveryBoyLocation();
        location.setOrderId(orderId);
        location.setDeliveryBoyId(deliveryBoyId);
        location.setLatitude(latitude);
        location.setLongitude(longitude);
        location.setTimestamp(LocalDateTime.now());
        location.setStatus(status);
        location.setSpeed(speed);
        location.setHeading(heading);

        // Save to MySQL
        DeliveryBoyLocation savedLocation = locationRepository.save(location);

        // Save to Redis
        redisLocationService.saveLocationByOrderId(orderId, savedLocation);
        redisLocationService.saveLocationByDeliveryBoyId(deliveryBoyId, savedLocation);

        // Broadcast to WebSocket topic
        messagingTemplate.convertAndSend("/topic/order/" + orderId, savedLocation);

        logger.info("Location updated and broadcasted for Order: {}", orderId);

        return savedLocation;
    }

    @Override
    public DeliveryBoyLocation getCurrentLocation(Long orderId) {
        logger.info("Fetching current location for Order: {}", orderId);

        DeliveryBoyLocation location = redisLocationService.getLocationByOrderId(orderId);

        if (location != null) {
            logger.info("Location found in Redis for Order: {}", orderId);
            return location;
        }

        logger.info("Location not in Redis, fetching from MySQL for Order: {}", orderId);
        location = locationRepository.findTopByOrderIdOrderByTimestampDesc(orderId)
                .orElse(null);

        if (location != null) {
            redisLocationService.saveLocationByOrderId(orderId, location);
        }

        return location;
    }

    @Override
    public List<DeliveryBoyLocation> getLocationHistory(Long orderId) {
        logger.info("Fetching location history for Order: {}", orderId);
        return locationRepository.findByOrderIdOrderByTimestampAsc(orderId);
    }



    @Override
    public List<DeliveryBoyLocation> getLocationHistoryInRange(Long orderId,
                                                               LocalDateTime startTime,
                                                               LocalDateTime endTime) {
        return locationRepository.findByOrderIdAndTimestampBetween(orderId, startTime, endTime);
    }

    @Override
    public Integer calculateETA(Long orderId, Double dropLatitude, Double dropLongitude) {
        DeliveryBoyLocation currentLocation = getCurrentLocation(orderId);
        if (currentLocation == null) {
            logger.warn("Cannot calculate ETA - no location found for Order: {}", orderId);
            return null;
        }

        double distance = calculateDistance(
                currentLocation.getLatitude(),
                currentLocation.getLongitude(),
                dropLatitude,
                dropLongitude
        );

        double speed = (currentLocation.getSpeed() != null && currentLocation.getSpeed() > 0)
                ? currentLocation.getSpeed()
                : 30.0;

        int eta = (int) Math.ceil((distance / speed) * 60);

        logger.info("ETA calculated for Order {}: {} minutes (distance: {} km, speed: {} km/h)",
                orderId, eta, distance, speed);

        return eta;
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int EARTH_RADIUS_KM = 6371;

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);

        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_KM * c;
    }

    @Override
    @Transactional
    public void completeDelivery(Long orderId) {
        logger.info("Completing delivery for Order: {}", orderId);

        DeliveryBoyLocation location = getCurrentLocation(orderId);
        if (location != null) {
            location.setStatus("DELIVERED");
            location.setTimestamp(LocalDateTime.now());
            locationRepository.save(location);

            redisLocationService.deleteLocationByOrderId(orderId);

            messagingTemplate.convertAndSend("/topic/order/" + orderId, location);
        }
    }

    @Override
    @Transactional
    public void cleanupOldLocations(int daysToKeep) {
        LocalDateTime cutoffTime = LocalDateTime.now().minusDays(daysToKeep);
        logger.info("Cleaning up location records older than: {}", cutoffTime);
        locationRepository.deleteByTimestampBefore(cutoffTime);
    }

}
