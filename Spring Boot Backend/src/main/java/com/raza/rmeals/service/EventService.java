package com.raza.rmeals.service;

import com.raza.rmeals.exception.RestaurantException;
import com.raza.rmeals.model.Events;

import java.util.List;

public interface EventService {
    public Events createEvent(Events event, Long restaurantId) throws RestaurantException;

    public List<Events> findAllEvent();

    public List<Events> findRestaurantsEvent(Long id);

    public void deleteEvent(Long id) throws Exception;

    public Events findById(Long id) throws Exception;
}
