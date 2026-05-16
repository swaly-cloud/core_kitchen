package com.corekitchen.shared.validation;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.lang.annotation.*;

/**
 * Composite constraint: min 8 chars, requires lowercase, uppercase, digit and special char.
 */
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.METHOD})
@Size(min = 8, max = 100, message = "Password must be 8-100 characters")
@Pattern(
    regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z0-9]).{8,}$",
    message = "Password must contain at least one lowercase, one uppercase, one digit and one special character"
)
public @interface ValidPassword {}
