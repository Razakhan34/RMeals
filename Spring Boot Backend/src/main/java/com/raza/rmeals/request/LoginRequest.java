package com.raza.rmeals.request;

import lombok.Data;

@Data
public class LoginRequest {

  private String email;
  private String password;
}
