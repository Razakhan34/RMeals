package com.raza.rmeals.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "delivery_boy_locations")
public class DeliveryBoyLocation {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false)
    private Long orderId;

    @Column(nullable = false)
    private Long deliveryBoyId;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    private Double speed; // in km/h

    private Double heading; // direction in degrees

    @Column(nullable = false)
    private String status; // ASSIGNED, PICKED_UP, IN_TRANSIT, NEARBY, DELIVERED
}
