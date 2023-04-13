package de.ingrid.igeserver.configuration

import de.ingrid.igeserver.configuration.acl.MyAuthenticationProvider
import jakarta.servlet.Filter
import jakarta.servlet.FilterChain
import jakarta.servlet.ServletRequest
import jakarta.servlet.ServletResponse
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.invoke
import org.springframework.security.core.authority.mapping.SimpleAuthorityMapper
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.csrf.CookieCsrfTokenRepository
import org.springframework.security.web.firewall.HttpFirewall
import org.springframework.security.web.firewall.StrictHttpFirewall

@Profile("!dev")
@Configuration
//@EnableWebSecurity
//@EnableMethodSecurity(jsr250Enabled = true, prePostEnabled = true)
internal class KeycloakConfig {
    val log = logger()

    @Autowired
    lateinit var generalProperties: GeneralProperties

    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        http {
            authorizeRequests {
                authorize("/api/config", permitAll)
                authorize("/api/upload/download/**", permitAll)
                authorize("/api/**", hasAnyRole("ige-user", "ige-super-admin"))
                authorize(anyRequest, permitAll)
            }
            if (generalProperties.enableCsrf) {
                csrf { csrfTokenRepository to CookieCsrfTokenRepository.withHttpOnlyFalse() }
            } else {
                csrf { disable() }
            }
            if (!generalProperties.enableCors) {
                cors { disable() }
            }
            if (!generalProperties.enableHttps) {
                requiresChannel {
                    anyRequest
                    requiresSecure
                }
            }
        }

        return http.build();
    }

    inner class RequestResponseLoggingFilter : Filter {
        override fun doFilter(
            request: ServletRequest,
            response: ServletResponse,
            chain: FilterChain
        ) {
            request as HttpServletRequest
            response as HttpServletResponse

            if (request.requestURI == "/error") {
                // redirect to login-resource, which redirects to keycloak or extract authentication
                // information from response
                if (SecurityContextHolder.getContext().authentication == null) {
                    response.sendRedirect("/sso/login")
                }
            }
            chain.doFilter(request, response)
        }
    }

    @Autowired
    lateinit var myAuthenticationProvider: MyAuthenticationProvider

    /**
     * Registers the KeycloakAuthenticationProvider with the authentication manager.
     */

    @Autowired
    fun configureGlobal(auth: AuthenticationManagerBuilder) {
        // check out: https://www.thomasvitale.com/spring-security-keycloak/
        val grantedAuthorityMapper = SimpleAuthorityMapper()
        grantedAuthorityMapper.setPrefix("ROLE_")
        val keycloakAuthenticationProvider = myAuthenticationProvider
        keycloakAuthenticationProvider.setGrantedAuthoritiesMapper(grantedAuthorityMapper)
        auth.authenticationProvider(keycloakAuthenticationProvider)
    }


    /**
     * Provide a session authentication strategy bean which should be of type
     * RegisterSessionAuthenticationStrategy for public or confidential applications
     * and NullAuthenticatedSessionStrategy for bearer-only applications.
     */

//    @Bean
//    override fun sessionAuthenticationStrategy(): SessionAuthenticationStrategy {
//        return RegisterSessionAuthenticationStrategy(SessionRegistryImpl())
//    }

    /**
     * Do allow semicolons in URL, which are matrix-parameters used by Angular
     *
     * @return the modified firewall
     */

    @Bean
    fun allowUrlEncodedSlashHttpFirewall(): HttpFirewall {
        val firewall = StrictHttpFirewall()
        firewall.setAllowUrlEncodedSlash(true)
        firewall.setAllowSemicolon(true)
        firewall.setAllowUrlEncodedPercent(true)
        return firewall
    }

//    @Bean
//    @ConditionalOnMissingBean(HttpSessionManager::class)
//    override fun httpSessionManager(): HttpSessionManager {
//        return HttpSessionManager()
//    }

}
