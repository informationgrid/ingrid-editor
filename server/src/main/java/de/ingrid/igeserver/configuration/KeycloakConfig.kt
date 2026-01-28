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
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.core.convert.converter.Converter
import org.springframework.http.client.SimpleClientHttpRequestFactory
import org.springframework.security.authentication.AbstractAuthenticationToken
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.invoke
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.authority.mapping.GrantedAuthoritiesMapper
import org.springframework.security.core.session.SessionRegistryImpl
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientProviderBuilder
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizedClientManager
import org.springframework.security.oauth2.client.web.OAuth2AuthorizedClientRepository
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.security.oauth2.core.oidc.user.OidcUserAuthority
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.session.RegisterSessionAuthenticationStrategy
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy
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
// @EnableMethodSecurity(jsr250Enabled = true, prePostEnabled = true)
internal class KeycloakConfig {
    val log = logger()

    @Autowired
    lateinit var generalProperties: GeneralProperties

    @Autowired
    lateinit var userRepository: UserRepository

    @Autowired
    lateinit var roleRepository: RoleRepository

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
    ): SecurityFilterChain {
        http {
            addFilterAfter<BasicAuthenticationFilter>(
                OAuth2TokenRefreshFilter(
                    authorizedClientManager,
                    authorizedClientRepository,
                ),
            )
            headers {
                frameOptions {
                    sameOrigin = true
                }
            }
            // For API/BFF style flows we want 401 on unauthenticated requests instead of 302 redirects during XHR
            exceptionHandling {
                authenticationEntryPoint =
                    org.springframework.security.web.authentication.HttpStatusEntryPoint(org.springframework.http.HttpStatus.UNAUTHORIZED)
            }
            authorizeHttpRequests {
                // secure api-routes except a few necessary ones
                authorize("/api/config", permitAll)
                authorize("/api/upload/download/**", permitAll)
                // BFF auth endpoints
                authorize("/auth/login", permitAll)
                authorize("/auth/logout", permitAll)
                authorize("/auth/me", authenticated) // hasAnyRole("ige-user", "ige-super-admin"))
                authorize("/login-error", permitAll)
                authorize("/access-denied", permitAll)
                authorize("/api/**", hasAnyRole("ige-user", "ige-super-admin"))
                authorize(anyRequest, permitAll)
            }
            oauth2Login {
                // After successful OAuth2 login, send the browser to the SPA root
                authenticationSuccessHandler =
                    org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler(
                        generalProperties.appUrl,
                    )
                authenticationFailureHandler =
                    org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler("/login-error")
                userInfoEndpoint {
                    userAuthoritiesMapper = OidcRealmRoleMapper(userRepository, roleRepository)
                }
            }
            sessionManagement {
                // Allow sessions for oauth2Login
                sessionCreationPolicy = org.springframework.security.config.http.SessionCreationPolicy.IF_REQUIRED
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
                    .withJwkSetUri(jwkSetUri)
                    .restOperations(RestTemplate(requestFactory)).build()
            }
        } else {
            return NimbusJwtDecoder
                .withJwkSetUri(jwkSetUri)
                .build()
        }
    }

    private fun jwtAuthenticationConverter(): Converter<Jwt, out AbstractAuthenticationToken> {
        val jwtConverter = JwtAuthenticationConverter()
        jwtConverter.setJwtGrantedAuthoritiesConverter(KeycloakRealmRoleConverter(userRepository, roleRepository))
        return jwtConverter
    }

    /**
     * Provide a session authentication strategy bean which should be of type
     * RegisterSessionAuthenticationStrategy for public or confidential applications
     * and NullAuthenticatedSessionStrategy for bearer-only applications.
     */

    @Bean
    fun sessionAuthenticationStrategy(): SessionAuthenticationStrategy = RegisterSessionAuthenticationStrategy(SessionRegistryImpl())

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

        // TODO: cache this function since expensive!
        val dbUserRoles = getDbUserRoles(jwt, isSuperAdmin)

        return grantedAuthorities + dbUserRoles
    }

    private fun getDbUserRoles(jwt: Jwt, isSuperAdmin: Boolean): Collection<GrantedAuthority> {
        val grantedAuthorities = mutableListOf<GrantedAuthority>()
        // TODO: make function static
        //        val username = authUtils.getUsernameFromPrincipal(jwt)
        val username = jwt.getClaimAsString("preferred_username")
        var userDb = userRepository.findByUserId(username)
        userDb = checkAndCreateSuperUser(userDb, isSuperAdmin, username)

        userDb?.curCatalog?.id?.let { catalogId ->
            val groups = userDb.groups.filter { it.catalog?.id == catalogId }

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

    private fun checkAndCreateSuperUser(
        userDb: UserInfo?,
        isSuperAdmin: Boolean,
        username: String,
    ): UserInfo? {
        if (userDb == null && isSuperAdmin) {
            // create user for super admin in db
            val userDbUpdate = UserInfo().apply {
                userId = username
                role = roleRepository.findByName("ige-super-admin")
                data = UserInfoData().apply {
                    this.creationDate = Date()
                    this.modificationDate = Date()
                }
            }
            return userRepository.save(userDbUpdate)
        }
        return userDb
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
    override fun mapAuthorities(authorities: MutableCollection<out GrantedAuthority>?): MutableCollection<out GrantedAuthority> {
        val result = mutableSetOf<GrantedAuthority>()

        // Keep any already-present authorities
        if (authorities != null) result.addAll(authorities)

        // Extract realm roles from OIDC id token
        val oidcAuth = authorities?.firstOrNull { it is OidcUserAuthority } as? OidcUserAuthority
        val idToken = oidcAuth?.idToken
        val claims = idToken?.claims ?: emptyMap<String, Any>()
        val realmAccess = claims["realm_access"] as? Map<*, *> ?: emptyMap<Any, Any>()
        val roles = (realmAccess["roles"] as? Collection<*>)?.filterIsInstance<String>() ?: emptyList()

        // Add ROLE_ prefix for Spring
        result.addAll(roles.map { SimpleGrantedAuthority("ROLE_$it") })

        // Add DB-derived roles/groups similar to JWT converter
        val username = (claims["preferred_username"] as? String) ?: (claims["email"] as? String)
        if (!username.isNullOrBlank()) {
            val isSuperAdmin = roles.contains("ige-super-admin")
            var userDb = userRepository.findByUserId(username)
            userDb = if (userDb == null && isSuperAdmin) {
                // create user for super admin in db
                val userDbUpdate = UserInfo().apply {
                    userId = username
                    role = roleRepository.findByName("ige-super-admin")
                    data = UserInfoData().apply {
                        this.creationDate = Date()
                        this.modificationDate = Date()
                    }
                }
                userRepository.save(userDbUpdate)
            } else {
                userDb
            }

            userDb?.curCatalog?.id?.let { catalogId ->
                val groups = userDb.groups.filter { it.catalog?.id == catalogId }
                groups.forEach {
                    result.add(SimpleGrantedAuthority("GROUP_${it.id}"))
                    if (it.permissions?.rootPermission == RootPermissionType.WRITE) {
                        result.add(SimpleGrantedAuthority("SPECIAL_write_root"))
                    } else if (groups.any { it.permissions?.rootPermission == RootPermissionType.READ }) {
                        result.add(SimpleGrantedAuthority("SPECIAL_read_root"))
                    }
                }
            }
            userDb?.role?.name?.let {
                result.add(SimpleGrantedAuthority("ROLE_$it"))
                result.add(SimpleGrantedAuthority("ROLE_ACL_ACCESS"))
            }
        }

        return result.toMutableSet()
    }
}
