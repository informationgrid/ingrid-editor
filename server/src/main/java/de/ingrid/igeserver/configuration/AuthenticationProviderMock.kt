package de.ingrid.igeserver.configuration

import org.apache.http.auth.BasicUserPrincipal
import org.springframework.beans.factory.annotation.Value
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

    @Value("\${dev.user.roles:}")
    lateinit var mockedUserRoles: Array<String>
    
    @Value("\${dev.user.groups:}")
    lateinit var mockedUserGroups: Array<String>

    @Value("\${dev.user.login:}")
    lateinit var mockedLogin: String

    @Value("\${dev.user.firstName:}")
    lateinit var mockedFirstName: String

    @Value("\${dev.user.lastName:}")
    lateinit var mockedLastName: String
    
    override fun authenticate(authentication: Authentication?): Authentication {

        val user = BasicUserPrincipal(mockedLogin)
        val usernamePasswordAuthenticationToken =
            UsernamePasswordAuthenticationToken(user, "", mockGrantedAuthorities())
        return usernamePasswordAuthenticationToken
    }

    private fun mockGrantedAuthorities(): List<GrantedAuthority> {
        return mockedUserGroups.map { SimpleGrantedAuthority("GROUP_$it") }
    }

    override fun supports(authentication: Class<*>?): Boolean {
        return true
    }

}
