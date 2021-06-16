package de.ingrid.igeserver.configuration

import de.ingrid.igeserver.configuration.acl.MyAuthenticationProvider
import org.apache.logging.log4j.kotlin.logger
import org.keycloak.adapters.springsecurity.KeycloakConfiguration
import org.keycloak.adapters.springsecurity.config.KeycloakWebSecurityConfigurerAdapter
import org.keycloak.adapters.springsecurity.filter.KeycloakSecurityContextRequestFilter
import org.keycloak.adapters.springsecurity.management.HttpSessionManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Profile
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.builders.WebSecurity
import org.springframework.security.core.authority.mapping.SimpleAuthorityMapper
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.session.SessionRegistryImpl
import org.springframework.security.web.authentication.logout.LogoutFilter
import org.springframework.security.web.authentication.session.RegisterSessionAuthenticationStrategy
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy
import org.springframework.security.web.csrf.CookieCsrfTokenRepository
import org.springframework.security.web.firewall.HttpFirewall
import org.springframework.security.web.firewall.StrictHttpFirewall
import org.springframework.security.web.servletapi.SecurityContextHolderAwareRequestFilter
import javax.servlet.Filter
import javax.servlet.FilterChain
import javax.servlet.ServletRequest
import javax.servlet.ServletResponse
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse


@Profile("!dev")
@KeycloakConfiguration
internal class KeycloakConfig : KeycloakWebSecurityConfigurerAdapter() {

    val log = logger()

    @Value("\${app.enable-csrf:false}")
    var csrfEnabled = false

    @Value("\${app.enable-cors:false}")
    private val corsEnabled = false

    @Value("\${app.enable-https:false}")
    private val httpsEnabled = false

    inner class RequestResponseLoggingFilter : Filter {
        override fun doFilter(
            request: ServletRequest,
            response: ServletResponse,
            chain: FilterChain
        ) {
            val req = request as HttpServletRequest
            val res = response as HttpServletResponse

            // only react on API-calls
            if (req.requestURI.startsWith("/api/")) {
                checkAndModifyResponse(res)
            } else if (req.requestURI == "/error") {
                // after setting error of api-request, another filter is ordering a redirect
                // to the /error page. This we must handle explicitly in order to return our
                // wanted return code
                checkAndModifyResponse(res)
            }
            chain.doFilter(request, response)
        }

        private fun checkAndModifyResponse(res: HttpServletResponse) {
            if (SecurityContextHolder.getContext().authentication == null) {
                val msg = "We seem to be logged out. Throwing exception in order to notify frontend correctly"
                log.info(msg)
                res.sendError(HttpServletResponse.SC_UNAUTHORIZED, msg)
            }
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
    override fun sessionAuthenticationStrategy(): SessionAuthenticationStrategy {
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
        return firewall
    }

    @Bean
    @ConditionalOnMissingBean(HttpSessionManager::class)
    override fun httpSessionManager(): HttpSessionManager {
        return HttpSessionManager()
    }

    override fun configure(web: WebSecurity) {
        web.ignoring().antMatchers("/assets/icons/IGE-NG_apple-touch-icon.png")
    }

    /**
     * Secure appropriate endpoints
     */
    override fun configure(httpSec: HttpSecurity) {
        var http = httpSec
        // TODO: call to super would trigger spring security issue 9787
        //       revert after Spring Security 5.5.1 has been released
        // super.configure(http);

        // BEGIN OF TEMPORARY FIX
        http
            .csrf().requireCsrfProtectionMatcher(keycloakCsrfRequestMatcher())
            .and()
            .sessionManagement()
            .sessionAuthenticationStrategy(sessionAuthenticationStrategy())
            .and()
            .addFilterBefore(keycloakPreAuthActionsFilter(), LogoutFilter::class.java)
            .addFilterBefore(keycloakAuthenticationProcessingFilter(), LogoutFilter::class.java)
            .addFilterAfter(keycloakSecurityContextRequestFilter(), SecurityContextHolderAwareRequestFilter::class.java)
//            .addFilterAfter(RequestResponseLoggingFilter(), SecurityContextHolderAwareRequestFilter::class.java)
            .addFilterAfter(
                keycloakAuthenticatedActionsRequestFilter(),
                SecurityContextHolderAwareRequestFilter::class.java
            )
            .exceptionHandling().authenticationEntryPoint(authenticationEntryPoint())
            .and()
            .logout()
            .addLogoutHandler(keycloakLogoutHandler())
            .logoutUrl("/sso/logout").permitAll()
            .logoutSuccessUrl("/")
        
        // END OF TEMPORARY FIX

        http = if (csrfEnabled) {
            http.csrf()
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .and() // make cookies readable within JS
        } else {
            http.csrf().disable()
        }
        if (!corsEnabled) {
            http = http.cors().disable()
        }
        if (!httpsEnabled) {
            http = http.requiresChannel()
                .anyRequest()
                .requiresSecure()
                .and()
        }
        http
//            .addFilterAfter(RequestResponseLoggingFilter(), KeycloakSecurityContextRequestFilter::class.java)
            .authorizeRequests()
            .anyRequest().authenticated()
            .and()
            .anonymous().disable() // force login when keycloak session timeouts because of inactivity
            .logout()
            .permitAll()
    }

}
