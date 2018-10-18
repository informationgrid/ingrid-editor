package de.ingrid.igeserver.utils;

import de.ingrid.igeserver.api.ApiException;
import org.keycloak.KeycloakPrincipal;
import org.keycloak.KeycloakSecurityContext;
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Principal;

@Service
public class AuthUtils {
    
    @Value( "${dev.keycloak.enabled:true}" )
    boolean isKeycloakEnabled;

    @Value( "${dev.user.login:}" )
    String mockedLogin;

    @SuppressWarnings("unchecked")
    public String getUsernameFromPrincipal(Principal principal) throws ApiException {
        // return a user for development when security is switched off
        if (!isKeycloakEnabled) {
            return mockedLogin;
        }
        
		if (principal == null) {
			throw new ApiException(500, "There's no principal!");
		}

		if (principal instanceof KeycloakAuthenticationToken) {
			return ((KeycloakAuthenticationToken) principal).getAccount().getPrincipal().getName();
		} else {
			return ((KeycloakPrincipal<KeycloakSecurityContext>) principal).getKeycloakSecurityContext().getToken()
			        .getPreferredUsername();
		}
	}
}
