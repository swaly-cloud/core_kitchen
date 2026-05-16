package com.corekitchen.auth;

import com.corekitchen.auth.jwt.JwtProperties;
import com.corekitchen.auth.jwt.JwtService;
import com.corekitchen.organizations.entity.Organization;
import com.corekitchen.users.entity.Role;
import com.corekitchen.users.entity.User;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private final JwtProperties props = new JwtProperties(
            "test-secret-please-only-for-tests-32-bytes-min-required-here-ok",
            15,
            7
    );
    private final JwtService service = new JwtService(props);

    @Test
    void generateAndParseAccessToken() {
        UUID orgId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Organization org = Organization.builder().id(orgId).name("Acme").slug("acme").build();
        User user = User.builder()
                .id(userId)
                .organization(org)
                .email("user@example.com")
                .role(Role.CHEF)
                .build();

        String token = service.generateAccessToken(user);
        Claims claims = service.parseAndValidate(token);

        assertThat(service.extractUserId(claims)).isEqualTo(userId);
        assertThat(service.extractOrganizationId(claims)).isEqualTo(orgId);
        assertThat(claims.get("role", String.class)).isEqualTo("CHEF");
        assertThat(claims.get("email", String.class)).isEqualTo("user@example.com");
    }

    @Test
    void invalidToken_throws() {
        assertThatThrownBy(() -> service.parseAndValidate("not-a-valid-jwt"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void rejectsShortSecret() {
        assertThatThrownBy(() -> new JwtService(new JwtProperties("tooshort", 15, 7)))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void refreshTokenIsRandom() {
        assertThat(service.generateRefreshTokenRaw()).isNotEqualTo(service.generateRefreshTokenRaw());
    }
}
