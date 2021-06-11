package de.ingrid.igeserver.development

import de.ingrid.igeserver.configuration.KeycloakConfig
import de.ingrid.igeserver.development.AuthenticationProviderMock
import org.keycloak.adapters.springsecurity.KeycloakConfiguration
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.security.authentication.AbstractAuthenticationToken
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.core.Authentication
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.mapping.SimpleAuthorityMapper
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse


@Profile("dev")
@KeycloakConfiguration
internal class KeycloakMockConfig : KeycloakConfig() {

    @Autowired
    private val authenticationProviderMock: AuthenticationProviderMock? = null

    /**
     * Registers the KeycloakAuthenticationProvider with the authentication manager.
     */
    @Autowired
    override fun configureGlobal(auth: AuthenticationManagerBuilder) {
        // check out: https://www.thomasvitale.com/spring-security-keycloak/
        val grantedAuthorityMapper = SimpleAuthorityMapper()
        grantedAuthorityMapper.setPrefix("ROLE_")
        val keycloakAuthenticationProvider = authenticationProviderMock
        auth.authenticationProvider(keycloakAuthenticationProvider)
    }

    /**
     * Secure appropriate endpoints
     */
    override fun configure(httpSec: HttpSecurity) {
        log.info("======================================================")
        log.info("================== DEVELOPMENT MODE ==================")
        log.info("======================================================")
        httpSec
            .addFilterAt(DevelopmentAuthenticationFilter(), UsernamePasswordAuthenticationFilter::class.java)
            .csrf().disable()
            .authorizeRequests().anyRequest().permitAll()
    }

}

private class DevelopmentAuthenticationFilter : AbstractAuthenticationProcessingFilter("/login") {
    override fun attemptAuthentication(request: HttpServletRequest?, response: HttpServletResponse?): Authentication {

        return DummyAuthenticationToken(emptyList())

    }
}

private class DummyAuthenticationToken(grantedAuthorities: List<GrantedAuthority>) :
    AbstractAuthenticationToken(grantedAuthorities) {

    private val token = "DummyPrincipal"

    override fun getCredentials(): Any {
        return token
    }

    override fun getPrincipal(): Any {
        return token
    }


}