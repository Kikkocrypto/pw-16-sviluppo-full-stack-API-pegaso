package com.pegaso.appointments.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow all origins (for MVP/demo)
        config.addAllowedOriginPattern("*");
        
        // Allowed HTTP methods
        config.addAllowedMethod("GET");
        config.addAllowedMethod("POST");
        config.addAllowedMethod("PATCH");
        config.addAllowedMethod("DELETE");
        config.addAllowedMethod("OPTIONS");
        
        // Allowed headers
        config.addAllowedHeader("Content-Type");
        config.addAllowedHeader("Accept");
        config.addAllowedHeader("X-Demo-Patient-Id");
        config.addAllowedHeader("X-Demo-Doctor-Id");
        config.addAllowedHeader("X-Demo-Admin-Id");
        
        // Allow credentials (if needed in the future)
        config.setAllowCredentials(false);
        
        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
}
