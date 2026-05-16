package com.corekitchen.auth.dto;

import com.corekitchen.users.dto.UserDto;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        UserDto user
) {}
