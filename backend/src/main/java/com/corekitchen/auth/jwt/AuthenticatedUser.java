package com.corekitchen.auth.jwt;

import com.corekitchen.users.entity.Role;

import java.util.UUID;

/**
 * Lightweight principal stored in the SecurityContext after a successful JWT auth.
 * Avoids re-querying the DB on every request.
 */
public record AuthenticatedUser(UUID userId, UUID organizationId, String email, Role role) {}
