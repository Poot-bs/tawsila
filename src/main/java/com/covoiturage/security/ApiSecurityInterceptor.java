package com.covoiturage.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Map;

@Component
public class ApiSecurityInterceptor implements HandlerInterceptor {
    private final JwtService jwtService;

    public ApiSecurityInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String path = request.getRequestURI();
        if (!path.startsWith("/api/")) {
            return true;
        }
        if (isPublic(request.getMethod(), path)) {
            return true;
        }

        String auth = request.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) {
            response.setStatus(401);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Authentification requise\"}");
            return false;
        }

        String token = auth.substring("Bearer ".length());
        Map<String, String> claims;
        try {
            claims = jwtService.parseAndValidate(token);
        } catch (Exception ex) {
            response.setStatus(401);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Token invalide\"}");
            return false;
        }

        SecurityContext.set(claims.get("userId"), claims.get("role"));
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        SecurityContext.clear();
    }

    private boolean isPublic(String method, String path) {
        if (path.equals("/api/auth/login") || path.equals("/api/auth/register") || path.equals("/api/auth/refresh")) {
            return true;
        }
        if (path.equals("/api/system/health")) {
            return true;
        }
        if (path.equals("/api/trajets") && "GET".equalsIgnoreCase(method)) {
            return true;
        }
        if (path.startsWith("/api/maps/") && "GET".equalsIgnoreCase(method)) {
            return true;
        }
        return false;
    }
}
