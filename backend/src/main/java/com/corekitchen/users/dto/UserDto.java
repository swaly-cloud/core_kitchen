package com.corekitchen.users.dto;

import com.corekitchen.users.entity.Role;
import com.corekitchen.users.entity.User;

import java.util.UUID;

public record UserDto(
        UUID id,
        String email,
        String firstName,
        String lastName,
        Role role,
        UUID organizationId,
        String organizationName
) {
    public static UserDto from(User user) {
        return new UserDto(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole(),
                user.getOrganization().getId(),
                user.getOrganization().getName()
        );
    }
}
