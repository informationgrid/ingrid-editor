package de.ingrid.igeserver.utils;

import java.security.Principal;

import org.keycloak.KeycloakPrincipal;
import org.keycloak.KeycloakSecurityContext;
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken;

public class AuthUtils {

	public static String getUsernameFromPrincipal(Principal principal) {
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
