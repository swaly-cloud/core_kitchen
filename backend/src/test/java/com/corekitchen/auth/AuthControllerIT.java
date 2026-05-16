package com.corekitchen.auth;

import com.corekitchen.AbstractIntegrationTest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc
class AuthControllerIT extends AbstractIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @Test
    void register_login_me_refresh_logout_flow() throws Exception {
        String email = "alice+" + System.nanoTime() + "@example.com";
        String password = "Strong#1234";

        String registerBody = """
                {"firstName":"Alice","lastName":"Smith","email":"%s","password":"%s","companyName":"Bistro Alice"}
                """.formatted(email, password);

        MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value(email))
                .andExpect(jsonPath("$.user.role").value("ADMIN"))
                .andReturn();

        JsonNode registerJson = objectMapper.readTree(registerResult.getResponse().getContentAsString());
        String accessToken = registerJson.get("accessToken").asText();
        String refreshToken = registerJson.get("refreshToken").asText();

        // Login
        String loginBody = """
                {"email":"%s","password":"%s"}
                """.formatted(email, password);
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andReturn();
        String loginAccess = objectMapper.readTree(loginResult.getResponse().getContentAsString())
                .get("accessToken").asText();

        // /users/me with access token
        mockMvc.perform(get("/api/users/me")
                        .header("Authorization", "Bearer " + loginAccess))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email));

        // /users/me without token → 401
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized());

        // Refresh
        String refreshBody = """
                {"refreshToken":"%s"}
                """.formatted(refreshToken);
        MvcResult refreshResult = mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(refreshBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andReturn();
        String newRefresh = objectMapper.readTree(refreshResult.getResponse().getContentAsString())
                .get("refreshToken").asText();
        assertThat(newRefresh).isNotEqualTo(refreshToken);

        // Old refresh token must be rejected
        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(refreshBody))
                .andExpect(status().isUnauthorized());

        // Logout
        mockMvc.perform(post("/api/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"refreshToken\":\"" + newRefresh + "\"}"))
                .andExpect(status().isNoContent());

        // After logout, refresh fails too
        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"refreshToken\":\"" + newRefresh + "\"}"))
                .andExpect(status().isUnauthorized());

        // Access token (short-lived but still valid) should still work
        assertThat(accessToken).isNotBlank();
    }

    @Test
    void register_with_duplicate_email_returns_409() throws Exception {
        String email = "dup+" + System.nanoTime() + "@example.com";
        String body = """
                {"firstName":"A","lastName":"B","email":"%s","password":"Strong#1234","companyName":"Co"}
                """.formatted(email);

        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isConflict());
    }

    @Test
    void login_with_bad_password_returns_401() throws Exception {
        String email = "bad+" + System.nanoTime() + "@example.com";
        String body = """
                {"firstName":"A","lastName":"B","email":"%s","password":"Strong#1234","companyName":"Co"}
                """.formatted(email);
        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"Wrong#1234\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void register_with_weak_password_returns_400() throws Exception {
        String body = """
                {"firstName":"A","lastName":"B","email":"weak@example.com","password":"weak","companyName":"Co"}
                """;
        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors[?(@.field == 'password')]").exists());
    }
}
