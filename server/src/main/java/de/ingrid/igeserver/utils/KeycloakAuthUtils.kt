package de.ingrid.igeserver.utils

import org.apache.logging.log4j.LogManager
import org.springframework.context.annotation.Profile
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.stereotype.Service
import java.security.Principal

@Service
@Profile("!dev")
class KeycloakAuthUtils : AuthUtils {

    companion object {
        private val log = LogManager.getLogger()
    }

    override fun getUsernameFromPrincipal(principal: Principal): String {

        return when (principal) {
            is JwtAuthenticationToken -> {
                (principal.principal as Jwt).getClaimAsString("preferred_username")
            }

            is UsernamePasswordAuthenticationToken -> {
                principal.principal as String
            }

            else -> {
                "???"
            }
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
            principal as JwtAuthenticationToken
            principal.authorities.contains(SimpleGrantedAuthority("ROLE_$role"))
        }
    }

    override fun isAdmin(principal: Principal): Boolean {
        return containsRole(principal, "cat-admin") || containsRole(principal, "ige-super-admin")
    }

    override fun isSuperAdmin(principal: Principal): Boolean {
        return containsRole(principal, "ige-super-admin")
    }
}
