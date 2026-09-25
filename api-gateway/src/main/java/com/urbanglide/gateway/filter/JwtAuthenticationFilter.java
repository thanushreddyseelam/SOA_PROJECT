package com.urbanglide.gateway.filter;

import com.urbanglide.gateway.util.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.function.Predicate;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtUtil jwtUtil;
    private static final List<String> OPEN_ENDPOINTS = List.of(
            "/auth/register",
            "/auth/register-driver",
            "/auth/driver/register",
            "/auth/login",
            "/actuator"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // 1. Check if request path is a public route (including POST /drivers for driver registration)
        boolean isPublicDriverRegister = "POST".equalsIgnoreCase(request.getMethod().name()) && "/drivers".equals(path);
        Predicate<ServerHttpRequest> isApiSecured = r -> !isPublicDriverRegister && OPEN_ENDPOINTS.stream().noneMatch(uri -> r.getURI().getPath().startsWith(uri));
        if (isApiSecured.test(request)) {
            // 2. Extract Authorization header
            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                return onError(exchange, "Missing Authorization header");
            }
            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

            // 3. If missing or doesn't start with "Bearer ", return 401
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return onError(exchange, "Invalid Authorization header format");
            }

            // 4. Extract token
            String token = authHeader.substring(7);
            try {
                // 5. Validate with JwtUtil
                Claims claims = jwtUtil.validateToken(token);
                String username = claims.getSubject();
                String role = claims.get("role", String.class);

                // 6. Enforce Role-Based Route Authorization
                HttpMethod method = request.getMethod();
                if (method != null) {
                    String httpMethod = method.name().toUpperCase();

                    // RIDER operations
                    if (httpMethod.equals("POST") && path.equals("/rides")) {
                        if (role == null || (!role.equalsIgnoreCase("RIDER") && !role.equalsIgnoreCase("ADMIN"))) {
                            return onForbidden(exchange, "Access denied: booking rides requires RIDER or ADMIN role");
                        }
                    }

                    // DRIVER ride state operations
                    else if (httpMethod.equals("PUT") &&
                            (path.matches("^/rides/\\d+/accept.*$") ||
                             path.matches("^/rides/\\d+/arrive.*$") ||
                             path.matches("^/rides/\\d+/start.*$") ||
                             path.matches("^/rides/\\d+/complete.*$"))) {
                        if (role == null || (!role.equalsIgnoreCase("DRIVER") && !role.equalsIgnoreCase("ADMIN"))) {
                            return onForbidden(exchange, "Access denied: driver ride operations require DRIVER or ADMIN role");
                        }
                    }

                    // DRIVER fleet telemetry operations
                    else if (httpMethod.equals("PUT") &&
                            (path.matches("^/drivers/\\d+/location.*$") ||
                             path.matches("^/drivers/\\d+/availability.*$") ||
                             path.matches("^/drivers/\\d+/status.*$"))) {
                        if (role == null || (!role.equalsIgnoreCase("DRIVER") && !role.equalsIgnoreCase("ADMIN"))) {
                            return onForbidden(exchange, "Access denied: driver telemetry updates require DRIVER or ADMIN role");
                        }
                    }
                }

                // 7. Strip client-supplied user headers and inject verified JWT headers
                ServerHttpRequest.Builder requestBuilder = exchange.getRequest().mutate();
                requestBuilder.headers(h -> {
                    h.remove("X-User-Username");
                    h.remove("X-User-Role");
                    h.remove("X-User-Id");
                });

                requestBuilder.header("X-User-Username", username != null ? username : "");
                if (role != null) {
                    requestBuilder.header("X-User-Role", role);
                }
                Object userIdObj = claims.get("userId");
                if (userIdObj != null) {
                    requestBuilder.header("X-User-Id", String.valueOf(userIdObj));
                }

                return chain.filter(exchange.mutate().request(requestBuilder.build()).build());
            } catch (io.jsonwebtoken.ExpiredJwtException e) {
                log.error("JWT token is expired: {}", e.getMessage());
                return onError(exchange, "JWT token is expired");
            } catch (Exception e) {
                log.error("JWT token validation failed: {}", e.getMessage());
                return onError(exchange, "Invalid JWT token");
            }
        }
        // 8. Continue filter chain for public routes
        return chain.filter(exchange);
    }

    private Mono<Void> onError(ServerWebExchange exchange, String errorMessage) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        String body = String.format("{\"error\": \"Unauthorized\", \"message\": \"%s\"}", errorMessage);
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        DataBuffer buffer = response.bufferFactory().wrap(bytes);
        return response.writeWith(Mono.just(buffer));
    }

    private Mono<Void> onForbidden(ServerWebExchange exchange, String errorMessage) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.FORBIDDEN);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        String body = String.format("{\"error\": \"Forbidden\", \"message\": \"%s\"}", errorMessage);
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        DataBuffer buffer = response.bufferFactory().wrap(bytes);
        return response.writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        return -1; // High priority
    }

    public JwtAuthenticationFilter(final JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }
}
