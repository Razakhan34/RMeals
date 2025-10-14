package com.raza.rmeals.service.delivery_tracking;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.raza.rmeals.model.DeliveryBoyLocation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class RedisLocationServiceImpl implements RedisLocationService {
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String LOCATION_KEY_PREFIX = "delivery:location:order:";
    private static final String DELIVERY_BOY_KEY_PREFIX = "delivery:location:boy:";
    private static final long CACHE_EXPIRATION_MINUTES = 60;

    @Override
    public void saveLocationByOrderId(Long orderId, DeliveryBoyLocation location) {
        String key = LOCATION_KEY_PREFIX + orderId;
        redisTemplate.opsForValue().set(key, location, CACHE_EXPIRATION_MINUTES, TimeUnit.MINUTES);
    }

    @Override
    public DeliveryBoyLocation getLocationByOrderId(Long orderId) {
        String key = LOCATION_KEY_PREFIX + orderId;
        Object value = redisTemplate.opsForValue().get(key);

        if (value == null) {
            return null;
        }

        // Handle both direct DeliveryBoyLocation and LinkedHashMap
        if (value instanceof DeliveryBoyLocation) {
            return (DeliveryBoyLocation) value;
        } else {
            // Convert LinkedHashMap to DeliveryBoyLocation
            return objectMapper.convertValue(value, DeliveryBoyLocation.class);
        }
    }

    @Override
    public void saveLocationByDeliveryBoyId(Long deliveryBoyId, DeliveryBoyLocation location) {
        String key = DELIVERY_BOY_KEY_PREFIX + deliveryBoyId;
        redisTemplate.opsForValue().set(key, location, CACHE_EXPIRATION_MINUTES, TimeUnit.MINUTES);
    }

    @Override
    public DeliveryBoyLocation getLocationByDeliveryBoyId(Long deliveryBoyId) {
        String key = DELIVERY_BOY_KEY_PREFIX + deliveryBoyId;
        Object value = redisTemplate.opsForValue().get(key);

        if (value == null) {
            return null;
        }

        // Handle both direct DeliveryBoyLocation and LinkedHashMap
        if (value instanceof DeliveryBoyLocation) {
            return (DeliveryBoyLocation) value;
        } else {
            // Convert LinkedHashMap to DeliveryBoyLocation
            return objectMapper.convertValue(value, DeliveryBoyLocation.class);
        }
    }

    @Override
    public void deleteLocationByOrderId(Long orderId) {
        String key = LOCATION_KEY_PREFIX + orderId;
        redisTemplate.delete(key);
    }

    @Override
    public boolean hasLocationByOrderId(Long orderId) {
        String key = LOCATION_KEY_PREFIX + orderId;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    @Override
    public void extendLocationTTL(Long orderId, long minutes) {
        String key = LOCATION_KEY_PREFIX + orderId;
        redisTemplate.expire(key, minutes, TimeUnit.MINUTES);
    }
}
