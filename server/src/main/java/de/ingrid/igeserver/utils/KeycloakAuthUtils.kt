package de.ingrid.igeserver.utils

import de.ingrid.igeserver.api.ApiException
import org.keycloak.KeycloakPrincipal
import org.keycloak.KeycloakSecurityContext
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service
import java.security.Principal

@Service
@Profile("!dev")
class KeycloakAuthUtils : AuthUtils {

    @Throws(ApiException::class)
    override fun getUsernameFromPrincipal(principal: Principal?): String {

        if (principal == null) {
            throw ApiException(500, "There's no principal!")
        }
        return if (principal is KeycloakAuthenticationToken) {
            principal.account.principal.name
        } else {
            (principal as KeycloakPrincipal<KeycloakSecurityContext>).keycloakSecurityContext.token
                    .preferredUsername
        }

    }
}