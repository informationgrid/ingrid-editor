/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver.development

import de.ingrid.igeserver.configuration.KeycloakConfig
import jakarta.servlet.FilterChain
import jakarta.servlet.ServletRequest
import jakarta.servlet.ServletResponse
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.security.authentication.AbstractAuthenticationToken
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.invoke
import org.springframework.security.core.Authentication
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter
import org.springframework.security.web.authentication.preauth.RequestHeaderAuthenticationFilter
import org.springframework.util.function.SingletonSupplier

@Profile("dev")
@Configuration
internal class KeycloakMockConfig : KeycloakConfig() {

    /**
     * Secure appropriate endpoints
     */
    @Bean
    override fun filterChain(http: HttpSecurity): SecurityFilterChain {
        log.info("======================================================")
        log.info("================== DEVELOPMENT MODE ==================")
        log.info("======================================================")
        http {
            addFilterAt<RequestHeaderAuthenticationFilter>(DevelopmentAuthenticationFilter())
            csrf { disable() }
            authorizeRequests {
                authorize(anyRequest, permitAll)
            }
        }
        return http.build()
    }
}

private class DevelopmentAuthenticationFilter : AbstractAuthenticationProcessingFilter("/login") {

    private val securityContextHolderStrategy = SecurityContextHolder.getContextHolderStrategy()

    override fun attemptAuthentication(request: HttpServletRequest, response: HttpServletResponse): Authentication {
        return DummyAuthenticationToken(emptyList())
    }

    override fun doFilter(request: ServletRequest, response: ServletResponse, chain: FilterChain) {
        val auths = listOf(SimpleGrantedAuthority("admin"))
        val context = securityContextHolderStrategy.createEmptyContext()
        context.authentication = DummyAuthenticationToken(auths)
        this.securityContextHolderStrategy.deferredContext = SingletonSupplier.of(context)

        chain.doFilter(request, response)
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
