package com.urbanglide.auth.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

public class JwtUtilTest {

    private JwtUtil jwtUtil;
    private final String testSecret = "dXJiYW5nbGlkZS1zZWNyZXQta2V5LWZvci1qd3QtYXV0aGVudGljYXRpb24tc3VwZXItc2VjdXJl";
    private final long testExpiration = 86400000L; // 24 hours

    @BeforeEach
    public void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", testSecret);
        ReflectionTestUtils.setField(jwtUtil, "expiration", testExpiration);
    }

    @Test
    public void testGenerateToken_ValidClaims() {
        String token = jwtUtil.generateToken("thanush", "RIDER");

        assertNotNull(token);
        assertFalse(token.isEmpty());

        String username = jwtUtil.extractUsername(token);
        String role = jwtUtil.extractRole(token);

        assertEquals("thanush", username);
        assertEquals("RIDER", role);
    }

    @Test
    public void testValidateToken_Success() {
        String token = jwtUtil.generateToken("thanush", "DRIVER");

        boolean isValid = jwtUtil.validateToken(token, "thanush");
        assertTrue(isValid);

        boolean isInvalidUser = jwtUtil.validateToken(token, "wrongUser");
        assertFalse(isInvalidUser);
    }

    @Test
    public void testIsTokenExpired_FreshToken_ReturnsFalse() {
        String token = jwtUtil.generateToken("thanush", "RIDER");
        assertFalse(jwtUtil.isTokenExpired(token));
    }
}
