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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            User existing = userRepository.findByUsername(request.getUsername()).orElse(null);
            if (existing != null) {
                String token = jwtUtil.generateToken(existing.getUsername(), existing.getRole().name(), existing.getId());
                return AuthResponse.builder()
                        .token(token)
                        .username(existing.getUsername())
                        .email(existing.getEmail())
                        .userId(existing.getId())
                        .role(existing.getRole().name())
                        .build();
            }
            throw new UsernameAlreadyExistsException("Username is already taken.");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email is already in use.");
        }

        // Security Enforcement: Public registration strictly creates RIDER accounts.
        // Administrative or Driver roles cannot be self-assigned via public signup.
        Role roleEnum = Role.RIDER;

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(roleEnum)
                .build();

        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name(), user.getId());
        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .email(user.getEmail())
                .userId(user.getId())
                .role(user.getRole().name())
                .build();
    }

    public AuthResponse registerDriver(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            User existing = userRepository.findByUsername(request.getUsername()).orElse(null);
            if (existing != null) {
                String token = jwtUtil.generateToken(existing.getUsername(), existing.getRole().name(), existing.getId());
                return AuthResponse.builder()
                        .token(token)
                        .username(existing.getUsername())
                        .email(existing.getEmail())
                        .userId(existing.getId())
                        .role(existing.getRole().name())
                        .build();
            }
            throw new UsernameAlreadyExistsException("Username is already taken.");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email is already in use.");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.DRIVER)
                .build();

        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name(), user.getId());
        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .email(user.getEmail())
                .userId(user.getId())
                .role(user.getRole().name())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name(), user.getId());
        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .email(user.getEmail())
                .userId(user.getId())
                .role(user.getRole().name())
                .build();
    }

    public void changePassword(String username, String currentPassword, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect");
        }

        if (newPassword == null || newPassword.trim().length() < 4) {
            throw new IllegalArgumentException("New password must be at least 4 characters long");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    @jakarta.annotation.PostConstruct
    public void initDefaultUsers() {
        try {
            if (!userRepository.existsByUsername("admin")) {
                userRepository.save(User.builder()
                        .username("admin")
                        .email("admin@urbanglide.com")
                        .password(passwordEncoder.encode("admin123"))
                        .role(Role.ADMIN)
                        .build());
            }
            if (!userRepository.existsByUsername("driver_raju")) {
                userRepository.save(User.builder()
                        .username("driver_raju")
                        .email("raju.driver@urbanglide.com")
                        .password(passwordEncoder.encode("driver123"))
                        .role(Role.DRIVER)
                        .build());
            }
            if (!userRepository.existsByUsername("driver_dave")) {
                userRepository.save(User.builder()
                        .username("driver_dave")
                        .email("driver.dave@example.com")
                        .password(passwordEncoder.encode("driver123"))
                        .role(Role.DRIVER)
                        .build());
            }
            if (!userRepository.existsByUsername("rider_john")) {
                userRepository.save(User.builder()
                        .username("rider_john")
                        .email("rider.john@example.com")
                        .password(passwordEncoder.encode("rider123"))
                        .role(Role.RIDER)
                        .build());
            }
        } catch (Exception e) {
            // Logging or silent bypass if already seeded
        }
    }
}

