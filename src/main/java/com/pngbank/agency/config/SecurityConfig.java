package com.pngbank.agency.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity; // <-- ADDED
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // <-- 1. ADDED THIS ANNOTATION to allow @PreAuthorize on controllers
public class SecurityConfig {

    private final ApiKeyAuthFilter apiKeyAuthFilter;
    private final UserContextFilter userContextFilter; // <-- 2. ADDED THE NEW FILTER

    // 3. INJECT BOTH FILTERS VIA CONSTRUCTOR
    public SecurityConfig(ApiKeyAuthFilter apiKeyAuthFilter, UserContextFilter userContextFilter) {
        this.apiKeyAuthFilter = apiKeyAuthFilter;
        this.userContextFilter = userContextFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(sm -> sm
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Allow health checks to pass without authentication
                .requestMatchers("/actuator/health").permitAll()
                .anyRequest().authenticated()
            )
            // 4. CONFIGURE THE FILTER CHAIN ORDER
            // First, check the Global API Key
            .addFilterBefore(apiKeyAuthFilter, UsernamePasswordAuthenticationFilter.class)
            // Then, right after the API Key passes, check the User Context (RBAC)
            .addFilterAfter(userContextFilter, ApiKeyAuthFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow your React dev server
        configuration.setAllowedOrigins(List.of("http://localhost:5173")); 
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        
        // 5. UPDATE CORS HEADERS
        // We must explicitly allow the new frontend headers through the browser security policy
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization", 
            "Content-Type", 
            "X-API-KEY", 
            "X-USER-ID",  // <-- ADDED
            "X-USER-ROLE" // <-- ADDED
        ));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}