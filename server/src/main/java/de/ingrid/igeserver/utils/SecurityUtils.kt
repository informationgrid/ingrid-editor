package de.ingrid.igeserver.utils

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder

fun setAdminAuthentication(): Authentication {
    val auth: Authentication =
        UsernamePasswordAuthenticationToken(
            "Scheduler",
            "Task",
            listOf(
                SimpleGrantedAuthority("cat-admin"),
                SimpleGrantedAuthority("ROLE_ACL_ACCESS"), // needed for ACL changes
            )
        )
    SecurityContextHolder.getContext().authentication = auth
    return auth
}
