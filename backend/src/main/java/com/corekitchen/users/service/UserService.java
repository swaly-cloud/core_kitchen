package com.corekitchen.users.service;

import com.corekitchen.shared.exception.InvalidCredentialsException;
import com.corekitchen.users.dto.ChangePasswordRequest;
import com.corekitchen.users.dto.UpdateProfileRequest;
import com.corekitchen.users.dto.UserDto;
import com.corekitchen.users.entity.User;
import com.corekitchen.users.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserDto getById(UUID id) {
        return UserDto.from(loadOrThrow(id));
    }

    @Transactional
    public UserDto updateProfile(UUID id, UpdateProfileRequest req) {
        User user = loadOrThrow(id);
        user.setFirstName(req.firstName().trim());
        user.setLastName(req.lastName().trim());
        return UserDto.from(userRepository.save(user));
    }

    @Transactional
    public void changePassword(UUID id, ChangePasswordRequest req) {
        User user = loadOrThrow(id);
        if (!passwordEncoder.matches(req.oldPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);
    }

    private User loadOrThrow(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + id));
    }
}
