package com.covoiturage.config;

import com.covoiturage.security.ApiSecurityInterceptor;
import com.covoiturage.security.RateLimitInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebSecurityConfig implements WebMvcConfigurer {
    private final RateLimitInterceptor rateLimitInterceptor;
    private final ApiSecurityInterceptor apiSecurityInterceptor;

    public WebSecurityConfig(RateLimitInterceptor rateLimitInterceptor, ApiSecurityInterceptor apiSecurityInterceptor) {
        this.rateLimitInterceptor = rateLimitInterceptor;
        this.apiSecurityInterceptor = apiSecurityInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(rateLimitInterceptor).addPathPatterns("/api/**").order(1);
        registry.addInterceptor(apiSecurityInterceptor).addPathPatterns("/api/**").order(2);
    }

    @Override
    public void addCorsMappings(org.springframework.web.servlet.config.annotation.CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("http://localhost:*", "https://*.vercel.app", "https://tawsila-eta.vercel.app")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Authorization")
                .allowCredentials(true);
    }
}
