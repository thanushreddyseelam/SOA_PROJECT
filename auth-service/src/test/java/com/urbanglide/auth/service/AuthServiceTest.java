package com.urbanglide.auth.service;

import com.urbanglide.auth.dto.AuthResponse;
import com.urbanglide.auth.dto.LoginRequest;
import com.urbanglide.auth.dto.RegisterRequest;
import com.urbanglide.auth.entity.Role;
import com.urbanglide.auth.entity.User;
import com.urbanglide.auth.exception.EmailAlreadyExistsException;
import com.urbanglide.auth.exception.UsernameAlreadyExistsException;
import com.urbanglide.auth.repository.UserRepository;
import com.urbanglide.auth.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private User testUser;

    @BeforeEach
    public void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("thanush")
                .email("thanush@example.com")
                .password("encoded_pass")
                .role(Role.RIDER)
                .build();
    }

    @Test
    public void testRegister_Success() {
        RegisterRequest request = new RegisterRequest("thanush", "thanush@example.com", "password123", "RIDER");

        when(userRepository.existsByUsername("thanush")).thenReturn(false);
        when(userRepository.existsByEmail("thanush@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded_pass");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtUtil.generateToken(eq("thanush"), eq("RIDER"), any())).thenReturn("mocked.jwt.token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("thanush", response.getUsername());
        assertEquals("RIDER", response.getRole());
        assertEquals("mocked.jwt.token", response.getToken());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    public void testRegisterDriver_Success() {
        RegisterRequest request = new RegisterRequest("driver1", "driver1@example.com", "password123", "DRIVER");

        User driverUser = User.builder()
                .id(2L)
                .username("driver1")
                .email("driver1@example.com")
                .password("encoded_pass")
                .role(Role.DRIVER)
                .build();

        when(userRepository.existsByUsername("driver1")).thenReturn(false);
        when(userRepository.existsByEmail("driver1@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded_pass");
        when(userRepository.save(any(User.class))).thenReturn(driverUser);
        when(jwtUtil.generateToken(eq("driver1"), eq("DRIVER"), any())).thenReturn("driver.jwt.token");

        AuthResponse response = authService.registerDriver(request);

        assertNotNull(response);
        assertEquals("driver1", response.getUsername());
        assertEquals("DRIVER", response.getRole());
        assertEquals("driver.jwt.token", response.getToken());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    public void testRegister_AttemptAdminPrivilegeEscalation_AssignsRiderOnly() {
        RegisterRequest request = new RegisterRequest("hacker", "hacker@example.com", "pass", "ADMIN");

        when(userRepository.existsByUsername("hacker")).thenReturn(false);
        when(userRepository.existsByEmail("hacker@example.com")).thenReturn(false);
        when(passwordEncoder.encode("pass")).thenReturn("encoded_pass");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            assertEquals(Role.RIDER, u.getRole(), "Role must strictly be forced to RIDER");
            return u;
        });
        when(jwtUtil.generateToken(eq("hacker"), eq("RIDER"), any())).thenReturn("token");

        AuthResponse response = authService.register(request);
        assertEquals("RIDER", response.getRole());
    }

    @Test
    public void testRegister_DuplicateUsername_ThrowsException() {
        RegisterRequest request = new RegisterRequest("thanush", "different@example.com", "password123", "RIDER");
        when(userRepository.existsByUsername("thanush")).thenReturn(true);

        assertThrows(UsernameAlreadyExistsException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    public void testRegister_DuplicateEmail_ThrowsException() {
        RegisterRequest request = new RegisterRequest("newuser", "thanush@example.com", "password123", "RIDER");
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("thanush@example.com")).thenReturn(true);

        assertThrows(EmailAlreadyExistsException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    public void testLogin_Success() {
        LoginRequest request = new LoginRequest("thanush", "password123");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(null);
        when(userRepository.findByUsername("thanush")).thenReturn(Optional.of(testUser));
        when(jwtUtil.generateToken(eq("thanush"), eq("RIDER"), any())).thenReturn("mocked.jwt.token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("thanush", response.getUsername());
        assertEquals("mocked.jwt.token", response.getToken());
    }

    @Test
    public void testLogin_InvalidCredentials_ThrowsException() {
        LoginRequest request = new LoginRequest("thanush", "wrongpassword");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadCredentialsException.class, () -> authService.login(request));
    }
}
