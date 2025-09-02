/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.invoke
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.preauth.RequestHeaderAuthenticationFilter
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Profile("dev")
@Configuration
internal class KeycloakMockConfig(val developmentAuthenticationFilter: DevelopmentAuthenticationFilter) : KeycloakConfig() {

    /**
     * Secure appropriate endpoints
     */
    @Bean
    override fun filterChain(http: HttpSecurity): SecurityFilterChain {
        log.info("======================================================")
        log.info("================== DEVELOPMENT MODE ==================")
        log.info("======================================================")
        http {
            addFilterAt<RequestHeaderAuthenticationFilter>(developmentAuthenticationFilter)
            csrf { disable() }
            authorizeHttpRequests {
                authorize(anyRequest, permitAll)
            }
        }
        return http.build()
    }
}

@Component
@Profile("dev")
class DevelopmentAuthenticationFilter(val authenticationProviderMock: AuthenticationProviderMock) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        if (SecurityContextHolder.getContext().authentication?.isAuthenticated != true) {
            // Verwende den AuthenticationProvider
            val dummyAuth = UsernamePasswordAuthenticationToken("dev", "dev")
            val authentication = authenticationProviderMock.authenticate(dummyAuth)
            SecurityContextHolder.getContext().authentication = authentication
        }

        filterChain.doFilter(request, response)
    }
}
