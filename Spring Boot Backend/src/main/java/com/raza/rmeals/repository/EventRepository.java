package com.raza.rmeals.repository;

import com.raza.rmeals.model.Events;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface EventRepository extends JpaRepository<Events, Long> {

    public List<Events> findEventsByRestaurantId(Long id);
}
