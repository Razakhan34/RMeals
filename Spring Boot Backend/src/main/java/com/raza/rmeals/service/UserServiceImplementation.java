package com.raza.rmeals.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.raza.rmeals.config.JwtProvider;
import com.raza.rmeals.exception.UserException;
import com.raza.rmeals.model.User;
import com.raza.rmeals.repository.UserRepository;

@Service
public class UserServiceImplementation implements UserService {

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private JwtProvider jwtProvider;

  @Autowired
  private PasswordEncoder passwordEncoder;
  // private PasswordResetTokenRepository passwordResetTokenRepository;
  // private JavaMailSender javaMailSender;

  @Override
  public User findUserProfileByJwt(String jwt) throws UserException {
    String email = jwtProvider.getEmailFromJwtToken(jwt);

    User user = userRepository.findByEmail(email);

    if (user == null) {
      throw new UserException("user not exist with email " + email);
    }
    // System.out.println("email user " + user.get().getEmail());
    return user;
  }

  // @Override
  // public User findUserProfileByJwt(String jwt) throws UserException {
  // String email = jwtProvider.getEmailFromJwtToken(jwt);

  // // User user = userRepository.findByEmail(email);

  // // if (user == null) {
  // // throw new UserException("user not exist with email " + email);
  // // }
  // // System.out.println("email user "+user.get().getEmail());
  // return user;
  // }

  @Override
  public User findUserByEmail(String email) throws UserException {
    // TODO Auto-generated method stub
    throw new UnsupportedOperationException("Unimplemented method 'findUserByEmail'");
  }

  @Override
  public List<User> findAllUsers() {
    // TODO Auto-generated method stub
    throw new UnsupportedOperationException("Unimplemented method 'findAllUsers'");
  }

  @Override
  public List<User> getPenddingRestaurantOwner() {
    // TODO Auto-generated method stub
    throw new UnsupportedOperationException("Unimplemented method 'getPenddingRestaurantOwner'");
  }

  @Override
  public void updatePassword(User user, String newPassword) {
    // TODO Auto-generated method stub
    throw new UnsupportedOperationException("Unimplemented method 'updatePassword'");
  }

  @Override
  public void sendPasswordResetEmail(User user) {
    // TODO Auto-generated method stub
    throw new UnsupportedOperationException("Unimplemented method 'sendPasswordResetEmail'");
  }

}
