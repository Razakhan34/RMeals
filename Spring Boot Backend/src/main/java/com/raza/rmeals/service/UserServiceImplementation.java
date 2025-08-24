package com.raza.rmeals.service;

import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import com.raza.rmeals.model.PasswordResetToken;
import com.raza.rmeals.repository.PasswordResetTokenRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.raza.rmeals.config.JwtProvider;
import com.raza.rmeals.exception.UserException;
import com.raza.rmeals.model.User;
import com.raza.rmeals.repository.UserRepository;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
public class UserServiceImplementation implements UserService {

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private JwtProvider jwtProvider;

  @Autowired
  private PasswordEncoder passwordEncoder;

  @Autowired
   private PasswordResetTokenRepository passwordResetTokenRepository;

  @Autowired
   private JavaMailSender javaMailSender;

  @Autowired
  private TemplateEngine templateEngine;

  @Value("${app.frontend.url}")
  private String frontendBaseUrl;

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



  @Override
  public User findUserByEmail(String email) throws UserException {
    User user = userRepository.findByEmail(email);

    if (user != null) {

      return user;
    }

    throw new UserException("user not exist with username " + email);
  }

  @Override
  public List<User> findAllUsers() {
    // TODO Auto-generated method stub
    throw new UnsupportedOperationException("Unimplemented method 'findAllUsers'");
  }

  @Override
  public List<User> getPenddingRestaurantOwner() {
    return userRepository.getPenddingRestaurantOwners();
  }

  @Override
  public void updatePassword(User user, String newPassword) {
    user.setPassword(passwordEncoder.encode(newPassword));
    userRepository.save(user);
  }

  @Override
  public void sendPasswordResetEmail(User user) throws MessagingException {

    // Generate a random token (you might want to use a library for this)
    String resetToken = generateRandomToken();

    // Calculate expiry date
    Date expiryDate = calculateExpiryDate();

    // Save the token in the database
    PasswordResetToken passwordResetToken = new PasswordResetToken(resetToken, user, expiryDate);
    passwordResetTokenRepository.save(passwordResetToken);

    // Send an email containing the reset link
//    sendEmail(user.getEmail(), "Password Reset",
//            "Click the following link to reset your password: http://localhost:3000/account/reset-password?token="
//                    + resetToken);


    Context context = new Context();
    context.setVariable("name", user.getFullName());
    context.setVariable("passwordResetURL", frontendBaseUrl + "/account/reset-password?token=" + resetToken);

    sendEmail(user.getEmail(),"Password Reset From RMeals",context,"email-password-reset");

    
  }

  private void sendEmail(String to, String subject, Context context,String templateName) throws MessagingException {
    String htmlContent = templateEngine.process(templateName, context);

    // Create a MimeMessage
    MimeMessage mimeMessage = javaMailSender.createMimeMessage();
    MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage, true);

    mimeMessageHelper.setTo(to);
    mimeMessageHelper.setSubject(subject);
    mimeMessageHelper.setText(htmlContent, true); // true enables HTML content
    mimeMessageHelper.setFrom("razatesting123@gmail.com");

    javaMailSender.send(mimeMessage);
  }

  private Date calculateExpiryDate() {
    Calendar cal = Calendar.getInstance();
    cal.setTime(new Date());
    cal.add(Calendar.MINUTE, 10);
    return cal.getTime();
  }

  private String generateRandomToken() {
    return UUID.randomUUID().toString();
  }

}
