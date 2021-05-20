package de.ingrid.igeserver.development

import de.ingrid.igeserver.repository.UserRepository
import org.apache.http.auth.BasicUserPrincipal
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Primary
import org.springframework.context.annotation.Profile
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.stereotype.Service


@Profile("dev")
@Primary
@Service
class AuthenticationProviderMock : AuthenticationProvider {

    @Autowired
    lateinit var config: DevelopmentProperties

    @Autowired
    lateinit var userRepo: UserRepository

    override fun authenticate(authentication: Authentication?): Authentication {

        val userId = config.logins[config.currentUser]
        val user = BasicUserPrincipal(userId)
        val userDb = userRepo.findByUserId(userId)
        val groups = userDb?.groups?.map { SimpleGrantedAuthority("GROUP_${it.name}") } ?: emptyList()
        val roles = config.roles[config.currentUser].split(",").map { SimpleGrantedAuthority(it) }
        return UsernamePasswordAuthenticationToken(user, "", groups + roles)
    }

    private fun mockGrantedAuthorities(): List<GrantedAuthority> {
        return config.groups[config.currentUser].split(",").map { SimpleGrantedAuthority("GROUP_$it") } +
                config.roles[config.currentUser].split(",").map { SimpleGrantedAuthority(it) }
    }

    override fun supports(authentication: Class<*>?): Boolean {
        return true
    }

}
