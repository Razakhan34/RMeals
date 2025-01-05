package com.raza.rmeals.response;

import com.raza.rmeals.model.USER_ROLE;
import lombok.Data;

@Data
public class AuthResponse {
    private String message;
    private String jwt;
    private USER_ROLE role;
}