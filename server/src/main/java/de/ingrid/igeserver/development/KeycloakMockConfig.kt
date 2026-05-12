/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
import de.ingrid.igeserver.configuration.StaleAuthoritiesRegistry
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.invoke
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository
import org.springframework.security.oauth2.client.web.OAuth2AuthorizedClientRepository
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.preauth.RequestHeaderAuthenticationFilter
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Profile("dev")
@Configuration
internal class KeycloakMockConfig(val developmentAuthenticationFilter: DevelopmentAuthenticationFilter) : KeycloakConfig() {

    @Bean
    fun clientRegistrationRepository(): ClientRegistrationRepository = object : ClientRegistrationRepository, Iterable<org.springframework.security.oauth2.client.registration.ClientRegistration> {
        override fun findByRegistrationId(registrationId: String?): org.springframework.security.oauth2.client.registration.ClientRegistration? = null
        override fun iterator(): Iterator<org.springframework.security.oauth2.client.registration.ClientRegistration> = emptyList<org.springframework.security.oauth2.client.registration.ClientRegistration>().iterator()
    }

    @Bean
    fun oauth2AuthorizedClientRepository(): OAuth2AuthorizedClientRepository = object : OAuth2AuthorizedClientRepository {
        override fun <T : org.springframework.security.oauth2.client.OAuth2AuthorizedClient?> loadAuthorizedClient(registrationId: String?, authentication: org.springframework.security.core.Authentication?, request: HttpServletRequest?): T? = null
        override fun saveAuthorizedClient(authorizedClient: org.springframework.security.oauth2.client.OAuth2AuthorizedClient?, authentication: org.springframework.security.core.Authentication?, request: HttpServletRequest?, response: HttpServletResponse?) {}
        override fun removeAuthorizedClient(registrationId: String?, authentication: org.springframework.security.core.Authentication?, request: HttpServletRequest?, response: HttpServletResponse?) {}
    }

    @Bean
    fun oauth2ClientProperties(): OAuth2ClientProperties {
        val properties = OAuth2ClientProperties()
        val registration = OAuth2ClientProperties.Registration()
        registration.clientId = "mock-client"
        registration.clientSecret = "mock-secret"
        properties.registration["keycloak"] = registration

        val provider = OAuth2ClientProperties.Provider()
        provider.authorizationUri = "http://localhost:8080/realms/mock/protocol/openid-connect/auth"
        properties.provider["keycloak"] = provider

        return properties
    }

    @Bean
    override fun authorizedClientManager(
        clientRegistrationRepository: ClientRegistrationRepository,
        authorizedClientRepository: OAuth2AuthorizedClientRepository,
    ): OAuth2AuthorizedClientManager = object : OAuth2AuthorizedClientManager {
        override fun authorize(authorizeRequest: org.springframework.security.oauth2.client.OAuth2AuthorizeRequest): org.springframework.security.oauth2.client.OAuth2AuthorizedClient? = null
    }

    /**
     * Secure appropriate endpoints
     */
    @Bean
    override fun filterChain(
        http: HttpSecurity,
        authorizedClientManager: OAuth2AuthorizedClientManager,
        authorizedClientRepository: OAuth2AuthorizedClientRepository,
        staleAuthoritiesRegistry: StaleAuthoritiesRegistry,
    ): SecurityFilterChain {
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
            val context = SecurityContextHolder.createEmptyContext()
            context.authentication = authentication
            SecurityContextHolder.setContext(context)
        }

        filterChain.doFilter(request, response)
    }
}
