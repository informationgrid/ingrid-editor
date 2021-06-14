package de.ingrid.igeserver.utils

import org.keycloak.KeycloakPrincipal
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken
import org.springframework.context.annotation.Profile
import org.springframework.security.core.authority.SimpleGrantedAuthority
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
        principal as KeycloakAuthenticationToken
        return principal.authorities.contains(SimpleGrantedAuthority(role))
    }

    override fun isAdmin(principal: Principal): Boolean {
        return containsRole(principal, "cat-admin") || containsRole(principal, "ige-super-admin")
    }
}
