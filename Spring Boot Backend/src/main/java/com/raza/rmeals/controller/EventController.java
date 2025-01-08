package com.raza.rmeals.controller;

import com.raza.rmeals.exception.RestaurantException;
import com.raza.rmeals.model.Events;
import com.raza.rmeals.response.ApiResponse;
import com.raza.rmeals.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class EventController {
    @Autowired
    public EventService eventService;

    @PostMapping("/admin/events/restaurant/{restaurantId}")
    public ResponseEntity<Events> createEvents(@RequestBody Events event,
                                               @PathVariable Long restaurantId) throws RestaurantException {
        Events createdEvents=eventService.createEvent(event, restaurantId);
        return new ResponseEntity<>(createdEvents, HttpStatus.ACCEPTED);
    }

    @GetMapping("/events")
    public ResponseEntity<List<Events>> findAllEvents() throws RestaurantException{
        List<Events> events = eventService.findAllEvent();
        return new ResponseEntity<>(events,HttpStatus.ACCEPTED);
    }

    @GetMapping("/admin/events/restaurant/{restaurantId}")
    public ResponseEntity<List<Events>> findRestaurantsEvents(
            @PathVariable Long restaurantId) throws RestaurantException {
        List<Events> events=eventService.findRestaurantsEvent(restaurantId);
        return new ResponseEntity<>(events,HttpStatus.ACCEPTED);
    }

    @DeleteMapping("/admin/events/{id}")
    public ResponseEntity<ApiResponse> deleteEvents(
            @PathVariable Long id) throws Exception{
        eventService.deleteEvent(id);
        ApiResponse res=new ApiResponse("Events Deleted",true);
        return new ResponseEntity<>(res,HttpStatus.ACCEPTED);
    }
}
