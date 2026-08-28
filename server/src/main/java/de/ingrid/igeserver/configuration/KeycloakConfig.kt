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
package de.ingrid.igeserver.configuration

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.UserInfo
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.UserInfoData
import de.ingrid.igeserver.persistence.postgresql.model.meta.RootPermissionType
import de.ingrid.igeserver.repository.RoleRepository
import de.ingrid.igeserver.repository.UserRepository
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.core.convert.converter.Converter
import org.springframework.http.HttpStatus
import org.springframework.http.client.SimpleClientHttpRequestFactory
import org.springframework.security.authentication.AbstractAuthenticationToken
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.invoke
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.core.AuthenticationException
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.authority.mapping.GrantedAuthoritiesMapper
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientProviderBuilder
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizedClientManager
import org.springframework.security.oauth2.client.web.OAuth2AuthorizedClientRepository
import org.springframework.security.oauth2.core.OAuth2AuthenticationException
import org.springframework.security.oauth2.core.oidc.user.OidcUserAuthority
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.AuthenticationFailureHandler
import org.springframework.security.web.authentication.HttpStatusEntryPoint
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter
import org.springframework.security.web.csrf.CookieCsrfTokenRepository
import org.springframework.security.web.firewall.HttpFirewall
import org.springframework.security.web.firewall.StrictHttpFirewall
import org.springframework.web.client.RestTemplate
import java.net.InetSocketAddress
import java.net.Proxy
import java.net.URI
import java.util.*

@Profile("!dev")
@Configuration
@EnableWebSecurity
internal class KeycloakConfig(
    val generalProperties: GeneralProperties,
    val userRepository: UserRepository,
    val roleRepository: RoleRepository,
) {
    val log = logger()

    @Value("\${keycloak.proxy-url:#{null}}")
    private val keycloakProxyUrl: String? = null

    @Value("\${spring.security.oauth2.client.provider.keycloak.jwk-set-uri:#{null}}")
    private val jwkSetUri: String? = null

    @Bean
    fun authorizedClientManager(
        clientRegistrationRepository: ClientRegistrationRepository,
        authorizedClientRepository: OAuth2AuthorizedClientRepository,
    ): OAuth2AuthorizedClientManager {
        val authorizedClientProvider = OAuth2AuthorizedClientProviderBuilder.builder()
            .authorizationCode()
            .refreshToken()
            .build()
        val authorizedClientManager = DefaultOAuth2AuthorizedClientManager(
            clientRegistrationRepository,
            authorizedClientRepository,
        )
        authorizedClientManager.setAuthorizedClientProvider(authorizedClientProvider)
        return authorizedClientManager
    }

    @Bean
    fun filterChain(
        http: HttpSecurity,
        authorizedClientManager: OAuth2AuthorizedClientManager,
        authorizedClientRepository: OAuth2AuthorizedClientRepository,
        staleAuthoritiesRegistry: StaleAuthoritiesRegistry,
    ): SecurityFilterChain {
        http {
            addFilterAfter<BasicAuthenticationFilter>(
                OAuth2TokenRefreshFilter(
                    authorizedClientManager,
                    authorizedClientRepository,
                ),
            )
            addFilterAfter<BasicAuthenticationFilter>(
                AuthoritiesRefreshFilter(staleAuthoritiesRegistry, userRepository, roleRepository),
            )
            headers {
                frameOptions {
                    sameOrigin = true
                }
            }
            // For API/BFF style flows we want 401 on unauthenticated requests instead of 302 redirects during XHR
            exceptionHandling {
                authenticationEntryPoint = HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)
            }
            authorizeHttpRequests {
                // secure api-routes except a few necessary ones
                authorize("/api/config", permitAll)
                authorize("/api/upload/download/**", permitAll)
                // BFF auth endpoints
                authorize("/auth/login", permitAll)
                authorize("/auth/logout", permitAll)
                authorize("/auth/me", hasAnyRole("ige-user", "ige-super-admin", "editor_user", "editor_admin"))
                authorize(
                    "/auth/update-password",
                    hasAnyRole("ige-user", "ige-super-admin", "editor_user", "editor_admin"),
                )
                authorize("/login-error", permitAll)
                authorize("/access-denied", permitAll)
                authorize("/api/**", hasAnyRole("ige-user", "ige-super-admin", "editor_user", "editor_admin"))
                authorize("/actuator/health", permitAll)
                if (generalProperties.actuatorPermitAll) {
                    authorize("/actuator/**", permitAll)
                } else {
                    authorize("/actuator/**", hasAnyRole("ige-super-admin", "editor_admin"))
                }
                authorize(anyRequest, permitAll)
            }
            oauth2Login {
                // After successful OAuth2 login, send the browser to the SPA root
                authenticationSuccessHandler = SimpleUrlAuthenticationSuccessHandler(
                    generalProperties.appUrl,
                )
                authenticationFailureHandler = KeycloakAuthenticationFailureHandler(
                    loginErrorUrl = "${generalProperties.appUrl.trimEnd('/')}/login-error",
                    loginUrl = "${generalProperties.appUrl.trimEnd('/')}/auth/login",
                )
                userInfoEndpoint {
                    userAuthoritiesMapper = OidcRealmRoleMapper(userRepository, roleRepository)
                }
            }
            sessionManagement {
                sessionCreationPolicy = SessionCreationPolicy.IF_REQUIRED
            }
            oauth2ResourceServer {
                jwt {
                    jwtAuthenticationConverter = jwtAuthenticationConverter()
                }
            }
            if (generalProperties.enableCsrf) {
                csrf { csrfTokenRepository to CookieCsrfTokenRepository.withHttpOnlyFalse() }
            } else {
                csrf { disable() }
            }
            if (!generalProperties.enableCors) {
                cors { disable() }
            }
            // Redirect to HTTPS only when HTTPS is explicitly enabled in configuration
            if (generalProperties.enableHttps) {
                redirectToHttps {}
            }
        }

        return http.build()
    }

    @Bean
    fun jwtDecoder(): JwtDecoder {
        if (keycloakProxyUrl != null) {
            with(URI(keycloakProxyUrl)) {
                val proxy = Proxy(Proxy.Type.HTTP, InetSocketAddress(host, port))
                val requestFactory = SimpleClientHttpRequestFactory()
                requestFactory.setProxy(proxy) // should already work with system properties: http.proxyHost
                return NimbusJwtDecoder
                    .withJwkSetUri(jwkSetUri!!)
                    .restOperations(RestTemplate(requestFactory)).build()
            }
        } else {
            return NimbusJwtDecoder
                .withJwkSetUri(jwkSetUri!!)
                .build()
        }
    }

    private fun jwtAuthenticationConverter(): Converter<Jwt, out AbstractAuthenticationToken> {
        val jwtConverter = JwtAuthenticationConverter()
        jwtConverter.setJwtGrantedAuthoritiesConverter(KeycloakRealmRoleConverter(userRepository, roleRepository))
        return jwtConverter
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

class KeycloakRealmRoleConverter(
    private val userRepository: UserRepository,
    private val roleRepository: RoleRepository,
) : Converter<Jwt, Collection<GrantedAuthority>> {
    override fun convert(jwt: Jwt): Collection<GrantedAuthority> {
        val realmAccess = jwt.claims["realm_access"] as Map<*, *>
        val roles = realmAccess["roles"] as List<*>

        // add roles from Keycloak
        val grantedAuthorities = roles.map { "ROLE_$it" } // prefix to map to a Spring Security "role"
            .map { SimpleGrantedAuthority(it) }

        val isSuperAdmin = roles.contains("ige-super-admin")

        val username = jwt.getClaimAsString("preferred_username")
        val dbUserRoles = KeycloakAuthorityEnricher.getDbUserAuthorities(
            username,
            isSuperAdmin,
            userRepository,
            roleRepository,
        )

        return (grantedAuthorities + dbUserRoles).distinct()
    }
}

/**
 * Common logic to enrich Spring Security authorities with data from the database.
 * Used by both session-based OIDC login and Bearer-token-based JWT authentication.
 */
object KeycloakAuthorityEnricher {
    fun getDbUserAuthorities(
        username: String?,
        isSuperAdmin: Boolean,
        userRepository: UserRepository,
        roleRepository: RoleRepository,
    ): Collection<GrantedAuthority> {
        if (username.isNullOrBlank()) return emptyList()

        val grantedAuthorities = mutableListOf<GrantedAuthority>()
        var userDb = userRepository.findByUserId(username)

        // check and create superuser if necessary
        if (userDb == null && isSuperAdmin) {
            val userDbUpdate = UserInfo().apply {
                userId = username
                role = roleRepository.findByName("ige-super-admin")
                data = UserInfoData().apply {
                    this.creationDate = Date()
                    this.modificationDate = Date()
                }
            }
            userDb = userRepository.save(userDbUpdate)
        }

        // get catalog id of user and fallback to first catalog if none is set
        val userCatalogId = userDb?.curCatalog?.id ?: userDb?.catalogs?.firstOrNull()?.id
        userCatalogId?.let { catalogId ->
            val groups = userDb!!.groups.filter { it.catalog?.id == catalogId }

            // add groups
            groups.forEach {
                grantedAuthorities.add(SimpleGrantedAuthority("GROUP_${it.id}"))
                if (it.permissions?.rootPermission == RootPermissionType.WRITE) {
                    grantedAuthorities.add(SimpleGrantedAuthority("SPECIAL_write_root"))
                } else if (groups.any { it.permissions?.rootPermission == RootPermissionType.READ }) {
                    grantedAuthorities.add(SimpleGrantedAuthority("SPECIAL_read_root"))
                }
            }
        }

        // add roles
        userDb?.role?.name?.let {
            // add acl access role for everyone
            grantedAuthorities.addAll(
                listOf(
                    SimpleGrantedAuthority("ROLE_$it"),
                    SimpleGrantedAuthority("ROLE_ACL_ACCESS"),
                ),
            )
        }

        return grantedAuthorities
    }
}

/**
 * Map Keycloak realm roles from OIDC login (session-based oauth2Login) into Spring authorities,
 * and enrich them with DB-derived roles/groups similar to the JWT converter above. This ensures
 * that users authenticated via oauth2Login have the same effective authorities as JWT users.
 */
class OidcRealmRoleMapper(
    private val userRepository: UserRepository,
    private val roleRepository: RoleRepository,
) : GrantedAuthoritiesMapper {
    override fun mapAuthorities(authorities: Collection<GrantedAuthority>): Collection<GrantedAuthority> {
        val result = mutableSetOf<GrantedAuthority>()

        // Keep any already-present authorities
        result.addAll(authorities)

        // Extract realm roles from OIDC id token and userInfo
        val oidcAuth = authorities?.firstOrNull { it is OidcUserAuthority } as? OidcUserAuthority
        val idTokenClaims = oidcAuth?.idToken?.claims ?: emptyMap<String, Any>()

        // Try both ID token and UserInfo claims (Keycloak might put them in either or both)
        fun extractRoles(claims: Map<String, Any>): List<String> {
            val realmAccess = claims["realm_access"] as? Map<*, *> ?: emptyMap<Any, Any>()
            val realmRoles = (realmAccess["roles"] as? Collection<*>)?.filterIsInstance<String>() ?: emptyList()

            val authoritiesList = mutableListOf<String>()
            val resourceAccess = claims["resource_access"] as? Map<*, *> ?: emptyMap<Any, Any>()
            resourceAccess.forEach { (clientName, access) ->
                if (access is Map<*, *>) {
                    val clientRoles = (access["roles"] as? Collection<*>)?.filterIsInstance<String>() ?: emptyList()
                    clientRoles.forEach { role ->
                        authoritiesList.add("${clientName}_$role")
                    }
                }
            }

            return realmRoles + authoritiesList
        }

        val roles = extractRoles(idTokenClaims).distinct()

        val allowedRoles = setOf("editor_user", "editor_admin", "ige-user", "ige-super-admin")

        if (roles.none { it in allowedRoles }) {
            return mutableListOf()
        }

        // Add ROLE_ prefix for Spring realm roles
        result.addAll(roles.map { SimpleGrantedAuthority("ROLE_$it") })

        // Add DB-derived roles/groups similar to JWT converter
        val username = (idTokenClaims["preferred_username"] as? String)
            ?: (idTokenClaims["email"] as? String)

        val isSuperAdmin = roles.contains("ige-super-admin") || roles.contains("editor_admin")
        val dbUserRoles = KeycloakAuthorityEnricher.getDbUserAuthorities(
            username,
            isSuperAdmin,
            userRepository,
            roleRepository,
        )

        result.addAll(dbUserRoles)

        return result
    }
}

/**
 * Authentication failure handler for OAuth2 login.
 * When authentication fails due to an expired or missing state ID (e.g. from an old login page
 * left open overnight), redirects the user to /auth/login so the authentication flow is
 * automatically re-initiated with a fresh state ID. Since the user was already authenticated
 * in Keycloak, Keycloak immediately redirects back and logs the user in seamlessly.
 * Other errors fall back to redirecting to the login error page.
 */
class KeycloakAuthenticationFailureHandler(
    loginErrorUrl: String,
    loginUrl: String,
) : AuthenticationFailureHandler {
    private val defaultFailureHandler = SimpleUrlAuthenticationFailureHandler(loginErrorUrl)
    private val loginRedirectHandler = SimpleUrlAuthenticationFailureHandler(loginUrl)

    override fun onAuthenticationFailure(
        request: HttpServletRequest,
        response: HttpServletResponse,
        exception: AuthenticationException,
    ) {
        if (isStateError(exception)) {
            loginRedirectHandler.onAuthenticationFailure(request, response, exception)
        } else {
            defaultFailureHandler.onAuthenticationFailure(request, response, exception)
        }
    }

    private fun isStateError(exception: AuthenticationException): Boolean {
        if (exception is OAuth2AuthenticationException) {
            val errorCode = exception.error.errorCode
            if (errorCode == "authorization_request_not_found" || errorCode == "invalid_state_parameter") {
                return true
            }
        }
        val message = exception.message ?: ""
        return message.contains("authorization_request_not_found", ignoreCase = true) ||
            message.contains("invalid_state_parameter", ignoreCase = true)
    }
}
