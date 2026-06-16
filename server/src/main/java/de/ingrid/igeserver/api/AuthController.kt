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
package de.ingrid.igeserver.api

import de.ingrid.igeserver.configuration.GeneralProperties
import de.ingrid.igeserver.model.UserInfo
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientProperties
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken
import org.springframework.security.oauth2.client.registration.ClientRegistration
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.net.URLEncoder
import java.nio.charset.StandardCharsets
import java.security.Principal

/**
 * Backend-For-Frontend authentication controller.
 * Provides simple endpoints the frontend can use to initiate login/logout
 * and fetch the current authenticated user, while all Keycloak specifics
 * stay on the server side.
 */
@RestController
@RequestMapping
class AuthController(
    private val usersApiController: UsersApiController,
    private val generalProperties: GeneralProperties,
    private val clientRegistrationRepository: ClientRegistrationRepository,
    private val oauth2Properties: OAuth2ClientProperties,
) {

    /**
     * Redirect to Spring Security's OAuth2 login entry point (Keycloak).
     */
    @GetMapping("/auth/login")
    fun login(request: HttpServletRequest): ResponseEntity<Void> {
        // Resolve the configured OAuth2 client registration dynamically instead of hardcoding "keycloak"
        val registrations = mutableListOf<ClientRegistration>()
        if (clientRegistrationRepository is Iterable<*>) {
            for (reg in clientRegistrationRepository) {
                if (reg is ClientRegistration) registrations.add(reg)
            }
        }
        val registrationId = registrations.firstOrNull()?.registrationId ?: "keycloak"
        val headers = HttpHeaders()
        val contextPath = request.contextPath ?: ""
        headers.location = java.net.URI.create("$contextPath/oauth2/authorization/$registrationId")
        return ResponseEntity(headers, HttpStatus.FOUND)
    }

    /**
     * Invalidate session and clear security context. Frontend can call this and then redirect as needed.
     */
    @GetMapping("/auth/logout")
    fun logout(
        request: HttpServletRequest,
        response: HttpServletResponse,
        principal: Principal?,
    ): ResponseEntity<Void> {
        val auth = principal as? Authentication

        // Try RP-initiated logout at Keycloak if we have an ID token
        var endSessionUrl: String? = null
        if (auth is OAuth2AuthenticationToken) {
            val principalUser = auth.principal
            val idToken = (principalUser as? OidcUser)?.idToken?.tokenValue
            if (!idToken.isNullOrBlank()) {
                val redirect = generalProperties.appUrl
                val encodedRedirect = URLEncoder.encode(redirect, StandardCharsets.UTF_8)

                val provider = oauth2Properties.provider["keycloak"]
                val authUri = provider?.authorizationUri ?: ""
                val serverUrl = authUri.substringBefore("/realms/")
                val realmName = authUri.substringAfter("/realms/").substringBefore("/")

                val realmBase = "$serverUrl/realms/$realmName"
                endSessionUrl =
                    "$realmBase/protocol/openid-connect/logout?id_token_hint=$idToken&post_logout_redirect_uri=$encodedRedirect"
            }
        }

        SecurityContextLogoutHandler().logout(request, response, auth)

        return if (endSessionUrl != null) {
            val headers = HttpHeaders()
            headers.location = java.net.URI.create(endSessionUrl)
            ResponseEntity(headers, HttpStatus.FOUND)
        } else {
            ResponseEntity.noContent().build()
        }
    }

    /**
     * Return the current user info, identical to /api/info/currentUser but under /auth for clarity.
     */
    @GetMapping("/auth/me")
    fun me(principal: Principal): ResponseEntity<UserInfo> = usersApiController.currentUserInfo(principal)

    /**
     * Redirect the current user to Keycloak's UPDATE_PASSWORD action.
     * After the password is changed, Keycloak redirects back through the normal OAuth2 login flow.
     */
    @GetMapping("/auth/update-password")
    fun updatePassword(request: HttpServletRequest): ResponseEntity<Void> {
        val registrations = mutableListOf<ClientRegistration>()
        if (clientRegistrationRepository is Iterable<*>) {
            for (reg in clientRegistrationRepository) {
                if (reg is ClientRegistration) registrations.add(reg)
            }
        }
        val clientId = registrations.firstOrNull()?.clientId ?: ""

        val provider = oauth2Properties.provider["keycloak"]
        val authUri = provider?.authorizationUri ?: ""
        val contextPath = request.contextPath ?: ""
        val redirectUri = URLEncoder.encode(
            "${generalProperties.appUrl}$contextPath/login/oauth2/code/keycloak",
            StandardCharsets.UTF_8,
        )

        val headers = HttpHeaders()
        headers.location = java.net.URI.create(
            "$authUri?response_type=code&client_id=$clientId&redirect_uri=$redirectUri&scope=openid&kc_action=UPDATE_PASSWORD",
        )
        return ResponseEntity(headers, HttpStatus.FOUND)
    }

    /**
     * Show a generic access denied error page served by the backend.
     */
    @GetMapping("/access-denied")
    fun accessDenied(): String = "Sie sind kein InGrid-Editor-Benutzer. Bitte wenden Sie sich an einen Administrator."

    /**
     * Show a generic login error page served by the backend.
     */
    @GetMapping("/login-error")
    fun loginError(): String = "Es konnte keine korrekte Verbindung zum Keycloak-Server hergestellt werden. Bitte prüfen Sie das ClientSecret und weitere Einstellungen."
}
