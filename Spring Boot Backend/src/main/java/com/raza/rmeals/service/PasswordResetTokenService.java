package com.raza.rmeals.service;

import com.raza.rmeals.model.PasswordResetToken;

public interface PasswordResetTokenService {
    public PasswordResetToken findByToken(String token);

    public void delete(PasswordResetToken resetToken);
}
