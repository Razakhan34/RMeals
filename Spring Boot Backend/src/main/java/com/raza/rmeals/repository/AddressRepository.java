package com.raza.rmeals.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.raza.rmeals.model.Address;

public interface AddressRepository extends JpaRepository<Address, Long> {

}
