package de.ingrid.igeserver.configuration

import de.ingrid.igeserver.configuration.acl.MyAuthenticationProvider
import jakarta.servlet.Filter
import jakarta.servlet.FilterChain
import jakarta.servlet.ServletRequest
import jakarta.servlet.ServletResponse
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.apache.logging.log4j.LogManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.core.convert.converter.Converter
import org.springframework.security.authentication.AbstractAuthenticationToken
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.invoke
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.authority.mapping.SimpleAuthorityMapper
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.session.SessionRegistryImpl
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.session.RegisterSessionAuthenticationStrategy
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy
import org.springframework.security.web.csrf.CookieCsrfTokenRepository
import org.springframework.security.web.firewall.HttpFirewall
import org.springframework.security.web.firewall.StrictHttpFirewall
import java.util.stream.Collectors


@Profile("!dev")
@Configuration
@EnableWebSecurity
//@EnableMethodSecurity(jsr250Enabled = true, prePostEnabled = true)
class KeycloakConfig {
    companion object {
        val log = LogManager.getLogger()
    }

    @Autowired
    lateinit var generalProperties: GeneralProperties

    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {

        http {
            headers { 
                frameOptions {
                    sameOrigin
                }
            }
            authorizeRequests {
                authorize("/api/config", permitAll)
                authorize("/api/upload/download/**", permitAll)
                authorize("/api/**", hasAnyRole("ige-user", "ige-super-admin"))
                authorize(anyRequest, permitAll)
            }
            oauth2Login { 
                
            }
            oauth2ResourceServer { 
                jwt { jwtAuthenticationConverter =  jwtAuthenticationConverter() }
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

    private fun jwtAuthenticationConverter(): Converter<Jwt, out AbstractAuthenticationToken>? {
        val jwtConverter = JwtAuthenticationConverter()
        jwtConverter.setJwtGrantedAuthoritiesConverter(KeycloakRealmRoleConverter())
        return jwtConverter
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

    @Bean
    fun sessionAuthenticationStrategy(): SessionAuthenticationStrategy {
        return RegisterSessionAuthenticationStrategy(SessionRegistryImpl())
    }

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


class KeycloakRealmRoleConverter : Converter<Jwt, Collection<GrantedAuthority>> {
    override fun convert(jwt: Jwt): Collection<GrantedAuthority> {
        val realmAccess = jwt.getClaims().get("realm_access") as Map<String, Any>
        return (realmAccess["roles"] as List<String>?)!!.stream()
                .map { roleName: String -> "ROLE_$roleName" } // prefix to map to a Spring Security "role"
                .map { role: String? -> SimpleGrantedAuthority(role) }
                .collect(Collectors.toList())
    }

}
