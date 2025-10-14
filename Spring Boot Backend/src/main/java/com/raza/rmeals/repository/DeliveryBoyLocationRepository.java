package com.raza.rmeals.repository;

import com.raza.rmeals.model.DeliveryBoyLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryBoyLocationRepository extends JpaRepository<DeliveryBoyLocation, Long> {
    // Get latest location for an order
    Optional<DeliveryBoyLocation> findTopByOrderIdOrderByTimestampDesc(Long orderId);

    // Get all locations for an order (for route history/playback)
    List<DeliveryBoyLocation> findByOrderIdOrderByTimestampAsc(Long orderId);

    // Get latest location for a delivery boy
    Optional<DeliveryBoyLocation> findTopByDeliveryBoyIdOrderByTimestampDesc(Long deliveryBoyId);

    // Get all active deliveries for a delivery boy
    @Query("SELECT d FROM DeliveryBoyLocation d WHERE d.deliveryBoyId = :deliveryBoyId " +
            "AND d.status NOT IN ('DELIVERED', 'CANCELLED') " +
            "ORDER BY d.timestamp DESC")
    List<DeliveryBoyLocation> findActiveDeliveriesByDeliveryBoyId(Long deliveryBoyId);

    // Get location history within time range (for analysis)
    List<DeliveryBoyLocation> findByOrderIdAndTimestampBetween(
            Long orderId,
            LocalDateTime startTime,
            LocalDateTime endTime
    );

    // Delete old location records (cleanup task)
    void deleteByTimestampBefore(LocalDateTime cutoffTime);
}
