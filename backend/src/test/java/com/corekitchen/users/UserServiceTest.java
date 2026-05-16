package com.corekitchen.users;

import com.corekitchen.AbstractIntegrationTest;
import com.corekitchen.organizations.entity.Organization;
import com.corekitchen.organizations.repository.OrganizationRepository;
import com.corekitchen.shared.exception.InvalidCredentialsException;
import com.corekitchen.users.dto.ChangePasswordRequest;
import com.corekitchen.users.dto.UpdateProfileRequest;
import com.corekitchen.users.entity.Role;
import com.corekitchen.users.entity.User;
import com.corekitchen.users.repository.UserRepository;
import com.corekitchen.users.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UserServiceTest extends AbstractIntegrationTest {

    @Autowired UserService userService;
    @Autowired UserRepository userRepository;
    @Autowired OrganizationRepository organizationRepository;
    @Autowired PasswordEncoder passwordEncoder;

    @Test
    void updateProfile_updatesFirstAndLastName() {
        User user = createUser("update+" + System.nanoTime() + "@example.com", "Old#1234");

        var dto = userService.updateProfile(user.getId(), new UpdateProfileRequest("Jane", "Doe"));

        assertThat(dto.firstName()).isEqualTo("Jane");
        assertThat(dto.lastName()).isEqualTo("Doe");
    }

    @Test
    void changePassword_succeeds_withCorrectOldPassword() {
        User user = createUser("pwd+" + System.nanoTime() + "@example.com", "Old#1234");

        userService.changePassword(user.getId(), new ChangePasswordRequest("Old#1234", "New#5678"));

        User reloaded = userRepository.findById(user.getId()).orElseThrow();
        assertThat(passwordEncoder.matches("New#5678", reloaded.getPasswordHash())).isTrue();
    }

    @Test
    void changePassword_fails_withWrongOldPassword() {
        User user = createUser("pwdfail+" + System.nanoTime() + "@example.com", "Old#1234");

        assertThatThrownBy(() ->
                userService.changePassword(user.getId(), new ChangePasswordRequest("Wrong#1234", "New#5678"))
        ).isInstanceOf(InvalidCredentialsException.class);
    }

    private User createUser(String email, String rawPassword) {
        Organization org = organizationRepository.save(
                Organization.builder().name("Test Org").slug("test-" + System.nanoTime()).build()
        );
        return userRepository.save(User.builder()
                .organization(org)
                .email(email)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .firstName("Test")
                .lastName("User")
                .role(Role.CHEF)
                .enabled(true)
                .build());
    }
}
