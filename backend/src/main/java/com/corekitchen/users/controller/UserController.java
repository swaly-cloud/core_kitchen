package com.corekitchen.users.controller;

import com.corekitchen.auth.jwt.AuthenticatedUser;
import com.corekitchen.users.dto.ChangePasswordRequest;
import com.corekitchen.users.dto.UpdateProfileRequest;
import com.corekitchen.users.dto.UserDto;
import com.corekitchen.users.service.UserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Users", description = "Current user management")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public UserDto getMe(@AuthenticationPrincipal AuthenticatedUser principal) {
        return userService.getById(principal.userId());
    }

    @PatchMapping("/me")
    public UserDto updateMe(@AuthenticationPrincipal AuthenticatedUser principal,
                            @Valid @RequestBody UpdateProfileRequest req) {
        return userService.updateProfile(principal.userId(), req);
    }

    @PostMapping("/me/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(@AuthenticationPrincipal AuthenticatedUser principal,
                               @Valid @RequestBody ChangePasswordRequest req) {
        userService.changePassword(principal.userId(), req);
    }
}
