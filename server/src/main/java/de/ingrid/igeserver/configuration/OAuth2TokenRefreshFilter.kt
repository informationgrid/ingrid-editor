/*
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
package de.ingrid.igeserver.configuration

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import jakarta.servlet.http.HttpServletResponseWrapper
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.client.ClientAuthorizationRequiredException
import org.springframework.security.oauth2.client.OAuth2AuthorizeRequest
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken
import org.springframework.security.oauth2.client.web.OAuth2AuthorizedClientRepository
import org.springframework.web.filter.OncePerRequestFilter
import java.time.Duration
import java.time.Instant

/**
 * Filter that ensures the OAuth2 access token is refreshed if it's expired.
 */
class OAuth2TokenRefreshFilter(
    private val authorizedClientManager: OAuth2AuthorizedClientManager,
    private val authorizedClientRepository: OAuth2AuthorizedClientRepository,
) : OncePerRequestFilter() {

    private val clockSkew = Duration.ofSeconds(5)

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        val authentication = SecurityContextHolder.getContext().authentication
        if (authentication is OAuth2AuthenticationToken) {
            val authorizedClient = authorizedClientRepository.loadAuthorizedClient<OAuth2AuthorizedClient>(
                authentication.authorizedClientRegistrationId,
                authentication,
                request,
            )

            if (authorizedClient != null && isExpired(authorizedClient.accessToken)) {
                val isAjax = isAjaxRequest(request)
                val wrappedResponse = if (isAjax) {
                    object : HttpServletResponseWrapper(response) {
                        override fun sendRedirect(location: String?) {
                            // Instead of redirecting, we throw an exception that we catch below
                            throw ClientAuthorizationRequiredException(authentication.authorizedClientRegistrationId)
                        }

                        override fun setStatus(sc: Int) {
                            if (sc == SC_MOVED_TEMPORARILY || sc == SC_SEE_OTHER) {
                                throw ClientAuthorizationRequiredException(authentication.authorizedClientRegistrationId)
                            }
                            super.setStatus(sc)
                        }

                        override fun sendError(sc: Int) {
                            if (sc == SC_MOVED_TEMPORARILY || sc == SC_SEE_OTHER) {
                                throw ClientAuthorizationRequiredException(authentication.authorizedClientRegistrationId)
                            }
                            super.sendError(sc)
                        }

                        override fun sendError(sc: Int, msg: String?) {
                            if (sc == SC_MOVED_TEMPORARILY || sc == SC_SEE_OTHER) {
                                throw ClientAuthorizationRequiredException(authentication.authorizedClientRegistrationId)
                            }
                            super.sendError(sc, msg)
                        }
                    }
                } else {
                    response
                }

                try {
                    val authorizeRequest =
                        OAuth2AuthorizeRequest.withClientRegistrationId(authentication.authorizedClientRegistrationId)
                            .principal(authentication)
                            .attribute(HttpServletRequest::class.java.name, request)
                            .attribute(HttpServletResponse::class.java.name, wrappedResponse)
                            .build()

                    // This will trigger a refresh if the token is expired and a refresh token is available
                    authorizedClientManager.authorize(authorizeRequest)
                } catch (ex: Exception) {
                    // If it's an AJAX request, we don't want a 302 redirect.
                    // We return 401 instead so the SPA can handle it.
                    if (isAjax) {
                        response.status = HttpServletResponse.SC_UNAUTHORIZED
                        response.writer.write("Token refresh failed and re-authentication is required.")
                        return
                    }
                    // For non-AJAX requests, we might let the exception propagate so Spring Security can redirect
                    throw ex
                }
            }
        }

        filterChain.doFilter(request, response)
    }

    private fun isExpired(accessToken: org.springframework.security.oauth2.core.OAuth2AccessToken): Boolean {
        val expiresAt = accessToken.expiresAt
        return expiresAt == null || Instant.now().isAfter(expiresAt.minus(clockSkew))
    }

    private fun isAjaxRequest(request: HttpServletRequest): Boolean {
        val requestedWith = request.getHeader("X-Requested-With")
        val accept = request.getHeader("Accept")
        return requestedWith == "XMLHttpRequest" || (accept != null && accept.contains("application/json"))
    }
}
