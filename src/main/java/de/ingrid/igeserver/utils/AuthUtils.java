package de.ingrid.igeserver.utils;

import java.security.Principal;

import org.keycloak.KeycloakPrincipal;
import org.keycloak.KeycloakSecurityContext;
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken;
import org.springframework.beans.factory.annotation.Value;

public class AuthUtils {
    
    @Value( "${keycloak.enabled:true}" )
    private static boolean isKeycloakEnabled;

    @SuppressWarnings("unchecked")
    public static String getUsernameFromPrincipal(Principal principal) {
        // return a user for development when security is switched off
        if (!isKeycloakEnabled) {
            return "ige";
        }
        
		if (principal == null) {
			throw new RuntimeException("There's no principal!");
		}

		if (principal instanceof KeycloakAuthenticationToken) {
			return ((KeycloakAuthenticationToken) principal).getAccount().getPrincipal().getName();
		} else {
			return ((KeycloakPrincipal<KeycloakSecurityContext>) principal).getKeycloakSecurityContext().getToken()
			        .getPreferredUsername();
		}
	}
}
