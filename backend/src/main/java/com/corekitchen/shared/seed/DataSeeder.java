package com.corekitchen.shared.seed;

import com.corekitchen.organizations.entity.Organization;
import com.corekitchen.organizations.repository.OrganizationRepository;
import com.corekitchen.users.entity.Role;
import com.corekitchen.users.entity.User;
import com.corekitchen.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Seeds the demo organization users on first boot. Idempotent.
 * The organization itself is created via Flyway V3, but users are created here
 * so we can hash the password with the same BCryptPasswordEncoder as production.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final String DEMO_SLUG = "demo";
    private static final String DEMO_PASSWORD = "Demo1234!";

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        Organization demo = organizationRepository.findBySlug(DEMO_SLUG).orElse(null);
        if (demo == null) {
            log.info("Demo organization not found; skipping demo user seed");
            return;
        }

        seedIfMissing(demo, "admin@demo.com", "Admin", "Demo", Role.ADMIN);
        seedIfMissing(demo, "chef@demo.com", "Chef", "Demo", Role.CHEF);
    }

    private void seedIfMissing(Organization org, String email, String first, String last, Role role) {
        if (userRepository.existsByEmail(email)) return;
        userRepository.save(User.builder()
                .organization(org)
                .email(email)
                .passwordHash(passwordEncoder.encode(DEMO_PASSWORD))
                .firstName(first)
                .lastName(last)
                .role(role)
                .enabled(true)
                .build());
        log.info("Seeded demo user {} ({}/{})", email, role, DEMO_PASSWORD);
    }
}
