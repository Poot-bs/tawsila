package com.covoiturage.security;

public final class SecurityContext {
    private static final ThreadLocal<String> USER_ID = new ThreadLocal<>();
    private static final ThreadLocal<String> ROLE = new ThreadLocal<>();

    private SecurityContext() {
    }

    public static void set(String userId, String role) {
        USER_ID.set(userId);
        ROLE.set(role);
    }

    public static String userId() {
        return USER_ID.get();
    }

    public static String role() {
        return ROLE.get();
    }

    public static void clear() {
        USER_ID.remove();
        ROLE.remove();
    }
}
