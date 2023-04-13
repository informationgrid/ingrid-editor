package de.ingrid.igeserver.utils

import org.apache.logging.log4j.kotlin.logger
import org.keycloak.KeycloakPrincipal
import org.springframework.context.annotation.Profile
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.stereotype.Service
import java.security.Principal

@Service
@Profile("!dev")
class KeycloakAuthUtils : AuthUtils {

    val log = logger()

    override fun getUsernameFromPrincipal(principal: Principal): String {

        return /*if (principal is KeycloakAuthenticationToken) {
            principal.account.keycloakSecurityContext.token.preferredUsername
        }  else */if (principal is UsernamePasswordAuthenticationToken) {
            principal.principal as String
        } else{
            (principal as KeycloakPrincipal<*>).keycloakSecurityContext.token.preferredUsername
        }
    }

    override fun getFullNameFromPrincipal(principal: Principal): String {
//        return try {
//            ((((principal as KeycloakAuthenticationToken).principal as KeycloakPrincipal<*>)
//                .keycloakSecurityContext as RefreshableKeycloakSecurityContext).token as AccessToken).name
//        } catch (ex: Exception) {
//            log.warn("Full name could not be extracted from principal")
            return getUsernameFromPrincipal(principal)
//        }
    }

    override fun containsRole(principal: Principal, role: String): Boolean {
        return if (principal is UsernamePasswordAuthenticationToken) {
            principal.authorities.contains(SimpleGrantedAuthority(role))
        } else {
//            principal as KeycloakAuthenticationToken
//            principal.account.roles.contains(role) || principal.authorities.contains(SimpleGrantedAuthority(role))
            throw RuntimeException("Problem with principal")
        }
    }

    override fun isAdmin(principal: Principal): Boolean {
        return containsRole(principal, "cat-admin") || containsRole(principal, "ige-super-admin")
    }

    override fun isSuperAdmin(principal: Principal): Boolean {
        return containsRole(principal, "ige-super-admin")
    }
}
