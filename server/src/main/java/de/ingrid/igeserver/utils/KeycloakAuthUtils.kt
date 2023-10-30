package de.ingrid.igeserver.utils

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Group
import de.ingrid.igeserver.services.CatalogService
import org.apache.logging.log4j.kotlin.logger
import org.springframework.context.annotation.Lazy
import org.springframework.context.annotation.Profile
import org.springframework.security.authentication.AbstractAuthenticationToken
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.stereotype.Service
import java.security.Principal

@Service
@Profile("!dev")
class KeycloakAuthUtils(@Lazy val catalogService: CatalogService) : AuthUtils {

    val log = logger()

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
        return try {
            ((principal as JwtAuthenticationToken).principal as Jwt).getClaimAsString("name")
        } catch (ex: Exception) {
            log.warn("Full name could not be extracted from principal: ${ex.message}")
            return getUsernameFromPrincipal(principal)
        }
    }

    override fun containsRole(principal: Principal, role: String): Boolean {
        val roles = getRoles(principal as AbstractAuthenticationToken)
        return roles.contains(SimpleGrantedAuthority(role)) || roles.contains(SimpleGrantedAuthority("ROLE_$role"))
    }

    private fun getRoles(principal: AbstractAuthenticationToken): Collection<GrantedAuthority> =
        principal.authorities ?: emptyList()


    override fun isAdmin(principal: Principal): Boolean {
        return containsRole(principal, "cat-admin") || containsRole(principal, "ige-super-admin")
    }

    override fun isSuperAdmin(principal: Principal): Boolean {
        return containsRole(principal, "ige-super-admin")
    }

    override fun getCurrentUserRoles(catalogId: String): Set<Group> {
        val authentication: Authentication = SecurityContextHolder.getContext().authentication
        val userName: String = getUsernameFromPrincipal(authentication)
        return catalogService.getUser(userName)?.getGroupsForCatalog(catalogId) ?: emptySet()
    }

    // TODO: this function is supposed to be used globally
    companion object {
        fun isAdminRole(vararg roles: String?) = roles.contains("ige-super-admin") || roles.contains("cat-admin")
    }

}
