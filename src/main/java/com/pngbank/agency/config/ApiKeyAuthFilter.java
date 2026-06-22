package com.pngbank.agency.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
public class ApiKeyAuthFilter extends OncePerRequestFilter {

    private static final String HEADER_NAME = "X-API-KEY";

    private static final List<String> VALID_KEYS = Arrays.asList(
            "agent-app-dev-key-7f3a9b2c1e4d",
            "internal-admin-key-9c8b7a6d5e4f"
    );

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String requestUri = request.getRequestURI();

        if (requestUri.startsWith("/actuator")) {
            filterChain.doFilter(request, response);
            return;
        }

        String apiKey = request.getHeader(HEADER_NAME);

        if (apiKey == null || apiKey.isBlank() || !VALID_KEYS.contains(apiKey.trim())) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            byte[] body = "{\"error\":\"UNAUTHORIZED\",\"message\":\"Missing or invalid API key\"}"
                    .getBytes("UTF-8");
            response.setContentLength(body.length);
            response.getOutputStream().write(body);
            response.getOutputStream().flush();
            return;
        }

        org.springframework.security.authentication.UsernamePasswordAuthenticationToken auth =
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        "api-key-client", null, java.util.Collections.emptyList());

        org.springframework.security.core.context.SecurityContextHolder
                .getContext().setAuthentication(auth);

        filterChain.doFilter(request, response);
    }
}