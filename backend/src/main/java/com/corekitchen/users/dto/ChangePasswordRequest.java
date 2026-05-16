package com.corekitchen.users.dto;

import com.corekitchen.shared.validation.ValidPassword;
import jakarta.validation.constraints.NotBlank;

public record ChangePasswordRequest(
        @NotBlank String oldPassword,
        @NotBlank @ValidPassword String newPassword
) {}
