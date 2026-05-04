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

import de.ingrid.igeserver.repository.RoleRepository
import de.ingrid.igeserver.repository.UserRepository
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.security.oauth2.core.oidc.user.OidcUserAuthority
import org.springframework.security.web.context.HttpSessionSecurityContextRepository
import org.springframework.web.filter.OncePerRequestFilter

class AuthoritiesRefreshFilter(
    private val staleAuthoritiesRegistry: StaleAuthoritiesRegistry,
    private val userRepository: UserRepository,
    private val roleRepository: RoleRepository,
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        val authentication = SecurityContextHolder.getContext().authentication
        if (authentication is OAuth2AuthenticationToken) {
            val login = authentication.name
            if (staleAuthoritiesRegistry.checkAndClear(login)) {
                val oidcUser = authentication.principal as? OidcUser
                if (oidcUser != null) {
                    // Re-derive authorities using the same mapper as the original login,
                    // reconstructing the OidcUserAuthority so the mapper can extract Keycloak roles from the ID token.
                    val freshAuthorities = OidcRealmRoleMapper(userRepository, roleRepository)
                        .mapAuthorities(mutableSetOf(OidcUserAuthority(oidcUser.idToken, oidcUser.userInfo)))

                    val newAuthentication = OAuth2AuthenticationToken(
                        oidcUser,
                        freshAuthorities,
                        authentication.authorizedClientRegistrationId,
                    )

                    val context = SecurityContextHolder.createEmptyContext()
                    context.authentication = newAuthentication
                    SecurityContextHolder.setContext(context)

                    request.getSession(false)?.setAttribute(
                        HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                        context,
                    )
                }
            }
        }

        filterChain.doFilter(request, response)
    }
}
