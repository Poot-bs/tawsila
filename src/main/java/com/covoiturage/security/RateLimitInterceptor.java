package com.covoiturage.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {
    private static class Counter {
        long windowStart;
        int count;
    }

    private final Map<String, Counter> counters = new ConcurrentHashMap<>();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        String path = request.getRequestURI();
        if (!path.startsWith("/api/")) {
            return true;
        }

        int limit = path.startsWith("/api/auth/") ? 15 : 120;
        long windowMs = 60_000;
        String key = request.getRemoteAddr() + "|" + path;

        long now = Instant.now().toEpochMilli();
        Counter c = counters.computeIfAbsent(key, k -> {
            Counter counter = new Counter();
            counter.windowStart = now;
            counter.count = 0;
            return counter;
        });

        synchronized (c) {
            if (now - c.windowStart > windowMs) {
                c.windowStart = now;
                c.count = 0;
            }
            c.count++;
            if (c.count > limit) {
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Trop de requetes, reessayez plus tard\"}");
                return false;
            }
        }
        return true;
    }
}
