package com.pngbank.agency.config;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;

@Component
public class UserContextFilter extends OncePerRequestFilter {

    // Inject your UserRepository here later to fetch the real role from the DB
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String userId = request.getHeader("X-USER-ID");
        String userRole = request.getHeader("X-USER-ROLE"); // Passed from frontend for simplicity in this example

        // If the API Key passed, and we have a User ID, set up the RBAC context
        if (userId != null && userRole != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            
            // Note: In production, fetch the role from the DB using userId instead of trusting the header
            SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + userRole);
            
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userId, null, Collections.singletonList(authority));
            
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        filterChain.doFilter(request, response);
    }
}