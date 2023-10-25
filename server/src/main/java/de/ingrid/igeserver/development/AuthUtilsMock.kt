package de.ingrid.igeserver.development

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Group
import de.ingrid.igeserver.utils.AuthUtils
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service
import java.security.Principal

@Service
@Profile("dev")
class AuthUtilsMock : AuthUtils {

    @Autowired
    lateinit var config: DevelopmentProperties

    override fun getUsernameFromPrincipal(principal: Principal): String {
        // return a user for development when security is switched off
        return config.logins?.get(config.currentUser) ?: "unknown"
    }

    override fun getFullNameFromPrincipal(principal: Principal): String {
        return "${config.firstName?.get(config.currentUser)} ${config.lastName?.get(config.currentUser)}"
    }

    override fun containsRole(principal: Principal, role: String): Boolean {
        principal as Authentication
        return principal.authorities.any { it.authority == role }
    }

    override fun isAdmin(principal: Principal): Boolean {
        return containsRole(principal, "cat-admin") || containsRole(principal, "ige-super-admin")
    }

    override fun isSuperAdmin(principal: Principal): Boolean {
        return containsRole(principal, "ige-super-admin")
    }

    override fun getCurrentUserRoles(catalogId: String): Set<Group> {
        return emptySet()
    }

}