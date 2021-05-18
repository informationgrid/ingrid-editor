package de.ingrid.igeserver.configuration.acl

import de.ingrid.igeserver.repository.UserRepository
import org.keycloak.KeycloakPrincipal
import org.keycloak.adapters.springsecurity.account.KeycloakRole
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.core.Authentication
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.authority.mapping.GrantedAuthoritiesMapper
import org.springframework.stereotype.Service

@Service
class MyAuthenticationProvider @Autowired constructor(val userRepository: UserRepository) : AuthenticationProvider {

    private var grantedAuthoritiesMapper: GrantedAuthoritiesMapper? = null

    fun setGrantedAuthoritiesMapper(grantedAuthoritiesMapper: GrantedAuthoritiesMapper?) {
        this.grantedAuthoritiesMapper = grantedAuthoritiesMapper
    }

    override fun authenticate(authentication: Authentication?): Authentication {

        val token = authentication as KeycloakAuthenticationToken
        val grantedAuthorities: MutableList<GrantedAuthority> = ArrayList()

        for (role in token.account.roles) {
            grantedAuthorities.add(KeycloakRole("ROLE_$role"))
        }

        // add groups
        val username = token.account.principal.name
        userRepository.findByUserId(username)?.groups
            ?.map { it.name }
            ?.forEach { grantedAuthorities.add(SimpleGrantedAuthority("GROUP_$it")) }

        return KeycloakAuthenticationToken(token.account, token.isInteractive, grantedAuthorities)

    }

    override fun supports(authentication: Class<*>?): Boolean {
        return KeycloakAuthenticationToken::class.java.isAssignableFrom(authentication)
    }

}