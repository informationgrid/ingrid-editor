package de.ingrid.igeserver.development

import de.ingrid.igeserver.configuration.KeycloakConfig
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.security.authentication.AbstractAuthenticationToken
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.invoke
import org.springframework.security.core.Authentication
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.authority.mapping.SimpleAuthorityMapper
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter

@Profile("dev")
@Configuration
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
    @Bean
    override fun filterChain(http: HttpSecurity): SecurityFilterChain {
        log.info("======================================================")
        log.info("================== DEVELOPMENT MODE ==================")
        log.info("======================================================")
        http {
            addFilterAt<UsernamePasswordAuthenticationFilter>(DevelopmentAuthenticationFilter())
            csrf { disable() }
            authorizeRequests {
                authorize(anyRequest, permitAll)
            }
        }
        return http.build()
    }

}

private class DevelopmentAuthenticationFilter : AbstractAuthenticationProcessingFilter("/login") {
    override fun attemptAuthentication(request: HttpServletRequest?, response: HttpServletResponse?): Authentication {

        val auths = listOf(SimpleGrantedAuthority("admin"))
        return DummyAuthenticationToken(auths)

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
