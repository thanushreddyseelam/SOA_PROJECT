package com.urbanglide.auth.dto;

import java.util.Objects;

public class AuthResponse {
    private String token;
    private String username;
    private String role;
    private Long userId;
    private String email;

    public AuthResponse() {
    }

    public AuthResponse(String token, String username, String role) {
        this(token, username, role, null, null);
    }

    public AuthResponse(String token, String username, String role, Long userId, String email) {
        this.token = token;
        this.username = username;
        this.role = role;
        this.userId = userId;
        this.email = email;
    }

    public static AuthResponseBuilder builder() {
        return new AuthResponseBuilder();
    }

    public static class AuthResponseBuilder {
        private String token;
        private String username;
        private String role;
        private Long userId;
        private String email;

        AuthResponseBuilder() {
        }

        public AuthResponseBuilder token(String token) {
            this.token = token;
            return this;
        }

        public AuthResponseBuilder username(String username) {
            this.username = username;
            return this;
        }

        public AuthResponseBuilder role(String role) {
            this.role = role;
            return this;
        }

        public AuthResponseBuilder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public AuthResponseBuilder email(String email) {
            this.email = email;
            return this;
        }

        public AuthResponse build() {
            return new AuthResponse(token, username, role, userId, email);
        }

        @Override
        public String toString() {
            return "AuthResponseBuilder{" +
                    "token='" + token + '\'' +
                    ", username='" + username + '\'' +
                    ", role='" + role + '\'' +
                    ", userId=" + userId +
                    ", email='" + email + '\'' +
                    '}';
        }
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AuthResponse that = (AuthResponse) o;
        return Objects.equals(token, that.token) &&
                Objects.equals(username, that.username) &&
                Objects.equals(role, that.role) &&
                Objects.equals(userId, that.userId) &&
                Objects.equals(email, that.email);
    }

    @Override
    public int hashCode() {
        return Objects.hash(token, username, role, userId, email);
    }

    @Override
    public String toString() {
        return "AuthResponse{" +
                "token='" + token + '\'' +
                ", username='" + username + '\'' +
                ", role='" + role + '\'' +
                ", userId=" + userId +
                ", email='" + email + '\'' +
                '}';
    }
}
