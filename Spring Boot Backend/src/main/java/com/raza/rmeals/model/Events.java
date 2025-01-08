package com.raza.rmeals.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Events {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String image;

    private String startedAt;

    private String endsAt;

    private String name;

    @ManyToOne
    private Restaurant restaurant;

    private String location;
}
