package com.corekitchen.auth.service;

import com.corekitchen.auth.dto.AuthResponse;
import com.corekitchen.auth.dto.LoginRequest;
import com.corekitchen.auth.dto.RefreshRequest;
import com.corekitchen.auth.dto.RegisterRequest;
import com.corekitchen.auth.jwt.JwtService;
import com.corekitchen.auth.jwt.RefreshToken;
import com.corekitchen.auth.jwt.RefreshTokenRepository;
import com.corekitchen.organizations.entity.Organization;
import com.corekitchen.organizations.repository.OrganizationRepository;
import com.corekitchen.shared.exception.EmailAlreadyUsedException;
import com.corekitchen.shared.exception.InvalidCredentialsException;
import com.corekitchen.shared.exception.InvalidRefreshTokenException;
import com.corekitchen.users.dto.UserDto;
import com.corekitchen.users.entity.Role;
import com.corekitchen.users.entity.User;
import com.corekitchen.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String normalizedEmail = req.email().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new EmailAlreadyUsedException(normalizedEmail);
        }

        Organization org = Organization.builder()
                .name(req.companyName().trim())
                .slug(uniqueSlugFrom(req.companyName()))
                .build();
        org = organizationRepository.save(org);

        User user = User.builder()
                .organization(org)
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(req.password()))
                .firstName(req.firstName().trim())
                .lastName(req.lastName().trim())
                .role(Role.ADMIN)
                .enabled(true)
                .build();
        user = userRepository.save(user);

        return issueTokens(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest req) {
        String normalizedEmail = req.email().trim().toLowerCase(Locale.ROOT);
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(InvalidCredentialsException::new);

        if (!user.isEnabled() || !passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest req) {
        String hash = hash(req.refreshToken());
        RefreshToken stored = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(InvalidRefreshTokenException::new);

        if (!stored.isActive()) {
            throw new InvalidRefreshTokenException();
        }

        stored.setRevokedAt(Instant.now());
        refreshTokenRepository.save(stored);

        return issueTokens(stored.getUser());
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) return;
        refreshTokenRepository.findByTokenHash(hash(refreshToken))
                .filter(t -> t.getRevokedAt() == null)
                .ifPresent(t -> {
                    t.setRevokedAt(Instant.now());
                    refreshTokenRepository.save(t);
                });
    }

    private AuthResponse issueTokens(User user) {
        String access = jwtService.generateAccessToken(user);
        String refreshRaw = jwtService.generateRefreshTokenRaw();

        RefreshToken rt = RefreshToken.builder()
                .user(user)
                .tokenHash(hash(refreshRaw))
                .expiresAt(jwtService.refreshTokenExpiry())
                .build();
        refreshTokenRepository.save(rt);

        return new AuthResponse(access, refreshRaw, UserDto.from(user));
    }

    private String uniqueSlugFrom(String name) {
        String base = name.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        if (base.isBlank()) base = "org";
        String candidate = base;
        int suffix = 2;
        while (organizationRepository.existsBySlug(candidate)) {
            candidate = base + "-" + suffix++;
        }
        return candidate;
    }

    private static String hash(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
