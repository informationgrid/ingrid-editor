package de.ingrid.igeserver.development

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

    override fun containsRole(principal: Principal, role: String): Boolean {
        principal as Authentication
        return principal.authorities.any { it.authority == role }
    }

}