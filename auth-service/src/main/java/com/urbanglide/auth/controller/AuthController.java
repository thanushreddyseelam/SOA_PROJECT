package com.urbanglide.auth.controller;

import com.urbanglide.auth.dto.AuthResponse;
import com.urbanglide.auth.dto.LoginRequest;
import com.urbanglide.auth.dto.RegisterRequest;
import com.urbanglide.auth.security.JwtUtil;
import com.urbanglide.auth.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping({"/register-driver", "/driver/register"})
    public ResponseEntity<AuthResponse> registerDriver(@RequestBody RegisterRequest request) {
        AuthResponse response = authService.registerDriver(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/validate")
    public ResponseEntity<AuthResponse> validateToken(@RequestHeader("Authorization") String tokenHeader) {
        if (tokenHeader != null && tokenHeader.startsWith("Bearer ")) {
            String token = tokenHeader.substring(7);
            try {
                String username = jwtUtil.extractUsername(token);
                String role = jwtUtil.extractRole(token);
                if (jwtUtil.validateToken(token, username)) {
                    com.urbanglide.auth.entity.User user = authService.getUserByUsername(username);
                    AuthResponse response = AuthResponse.builder()
                            .token(token)
                            .username(username)
                            .role(role)
                            .userId(user != null ? user.getId() : null)
                            .email(user != null ? user.getEmail() : null)
                            .build();
                    return new ResponseEntity<>(response, HttpStatus.OK);
                }
            } catch (Exception e) {
                // Token invalid
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestHeader("Authorization") String tokenHeader,
            @RequestBody com.urbanglide.auth.dto.ChangePasswordRequest request) {
        if (tokenHeader == null || !tokenHeader.startsWith("Bearer ")) {
            return new ResponseEntity<>(java.util.Map.of("message", "Bearer token missing"), HttpStatus.UNAUTHORIZED);
        }
        String token = tokenHeader.substring(7);
        try {
            String username = jwtUtil.extractUsername(token);
            if (!jwtUtil.validateToken(token, username)) {
                return new ResponseEntity<>(java.util.Map.of("message", "Invalid or expired token"), HttpStatus.UNAUTHORIZED);
            }
            authService.changePassword(username, request.getCurrentPassword(), request.getNewPassword());
            return ResponseEntity.ok(java.util.Map.of("message", "Password updated successfully"));
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(java.util.Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(java.util.Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(java.util.Map.of("message", "Failed to update password"));
        }
    }
}

