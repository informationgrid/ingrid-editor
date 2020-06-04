package de.ingrid.igeserver.utils

import de.ingrid.igeserver.api.ApiException
import org.keycloak.KeycloakPrincipal
import org.keycloak.KeycloakSecurityContext
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken
import java.security.Principal

fun Principal?.getUsernameFromPrincipal(): String {
    if (this == null) {
        throw ApiException(500, "There's no principal!")
    }

    return if (this is KeycloakAuthenticationToken) {
        this.account.principal.name
    } else {
        (this as KeycloakPrincipal<KeycloakSecurityContext>).keycloakSecurityContext.token
                .preferredUsername
    }
}