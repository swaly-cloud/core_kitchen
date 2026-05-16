package com.corekitchen.shared.tenant;

import java.util.UUID;

/**
 * ThreadLocal holder for the current tenant (organization) id.
 * Populated by JwtAuthenticationFilter and read by services that need to scope queries.
 */
public final class TenantContext {

    private static final ThreadLocal<UUID> CURRENT_ORG = new ThreadLocal<>();

    private TenantContext() {}

    public static void setOrganizationId(UUID organizationId) {
        CURRENT_ORG.set(organizationId);
    }

    public static UUID getOrganizationId() {
        return CURRENT_ORG.get();
    }

    public static UUID requireOrganizationId() {
        UUID id = CURRENT_ORG.get();
        if (id == null) {
            throw new IllegalStateException("No tenant set in current context");
        }
        return id;
    }

    public static void clear() {
        CURRENT_ORG.remove();
    }
}
