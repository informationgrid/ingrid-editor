package de.ingrid.igeserver.utils

import de.ingrid.igeserver.ClientException
import org.keycloak.KeycloakPrincipal
import org.keycloak.adapters.springsecurity.account.KeycloakRole
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service
import java.security.Principal

@Service
@Profile("!dev")
class KeycloakAuthUtils : AuthUtils {

    override fun getUsernameFromPrincipal(principal: Principal): String {

        return if (principal is KeycloakAuthenticationToken) {
            principal.account.principal.name
        } else {
            (principal as KeycloakPrincipal<*>).keycloakSecurityContext.token.preferredUsername
        }
    }

    override fun containsRole(principal: Principal, role: String): Boolean {
        return (principal as KeycloakAuthenticationToken).authorities.contains(KeycloakRole("ROLE_$role"))
    }
}
