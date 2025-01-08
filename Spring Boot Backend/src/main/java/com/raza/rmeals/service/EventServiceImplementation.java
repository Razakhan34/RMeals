package com.raza.rmeals.service;

import com.raza.rmeals.exception.RestaurantException;
import com.raza.rmeals.model.Events;
import com.raza.rmeals.model.Restaurant;
import com.raza.rmeals.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EventServiceImplementation implements EventService {
    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private RestaurantService restaurantService;

    @Override
    public Events createEvent(Events event, Long restaurantId) throws RestaurantException {
        Restaurant restaurant=restaurantService.findRestaurantById(restaurantId);

        Events createdEvent=new Events();
        createdEvent.setRestaurant(restaurant);
        createdEvent.setImage(event.getImage());
        createdEvent.setStartedAt(event.getStartedAt());
        createdEvent.setEndsAt(event.getEndsAt());
        createdEvent.setLocation(event.getLocation());
        createdEvent.setName(event.getName());

        return eventRepository.save(createdEvent);
    }

    @Override
    public List<Events> findAllEvent() {
        // TODO Auto-generated method stub
        return eventRepository.findAll();
    }

    @Override
    public List<Events> findRestaurantsEvent(Long id) {
        // TODO Auto-generated method stub
        return eventRepository.findEventsByRestaurantId(id);
    }

    @Override
    public void deleteEvent(Long id) throws Exception {
        Events event=findById(id);
        eventRepository.delete(event);

    }

    @Override
    public Events findById(Long id) throws Exception {
        Optional<Events> opt=eventRepository.findById(id);
        if(opt.isPresent()) {
            return opt.get();
        }
        throw new Exception("event not found with id "+id);

    }
}
