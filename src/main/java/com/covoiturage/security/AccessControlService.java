package com.covoiturage.security;

import com.covoiturage.exception.ValidationException;
import com.covoiturage.model.UserRole;
import org.springframework.stereotype.Service;

@Service
public class AccessControlService {
    public void requireRole(UserRole role) {
        String currentRole = SecurityContext.role();
        if (currentRole == null || !currentRole.equals(role.name())) {
            throw new ValidationException("Acces refuse pour ce role");
        }
    }

    public void requireAnyRole(UserRole... roles) {
        String currentRole = SecurityContext.role();
        if (currentRole == null) {
            throw new ValidationException("Acces refuse");
        }
        for (UserRole role : roles) {
            if (role.name().equals(currentRole)) {
                return;
            }
        }
        throw new ValidationException("Acces refuse pour ce role");
    }

    public void requireSelfOrRole(String targetUserId, UserRole... elevatedRoles) {
        String userId = SecurityContext.userId();
        if (targetUserId != null && targetUserId.equals(userId)) {
            return;
        }
        requireAnyRole(elevatedRoles);
    }
}
