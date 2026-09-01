/*
 * ==================================================
 * Copyright (C) 2026 wemove digital solutions GmbH
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

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.oauth2.core.OAuth2AuthenticationException
import org.springframework.security.oauth2.core.OAuth2Error

class KeycloakConfigTest {

    @Test
    fun `authenticationFailureHandler redirects to appUrl login-error on generic failure`() {
        val generalProperties = GeneralProperties(
            uuid = "test-uuid",
            enableCsrf = false,
            enableCors = false,
            enableHttps = false,
            markInsteadOfDelete = false,
            appUrl = "http://192.168.0.228",
            externalHelp = null,
            openAIHost = "",
            openAIModel = "",
        )

        val failureHandler = KeycloakAuthenticationFailureHandler(
            loginErrorUrl = "${generalProperties.appUrl.trimEnd('/')}/login-error",
            loginUrl = "${generalProperties.appUrl.trimEnd('/')}/auth/login",
        )
        val request = MockHttpServletRequest()
        val response = MockHttpServletResponse()

        failureHandler.onAuthenticationFailure(request, response, BadCredentialsException("Generic failure"))

        assertEquals("http://192.168.0.228/login-error", response.redirectedUrl)
    }

    @Test
    fun `authenticationFailureHandler redirects to appUrl auth login on authorization_request_not_found`() {
        val generalProperties = GeneralProperties(
            uuid = "test-uuid",
            enableCsrf = false,
            enableCors = false,
            enableHttps = false,
            markInsteadOfDelete = false,
            appUrl = "http://192.168.0.228",
            externalHelp = null,
            openAIHost = "",
            openAIModel = "",
        )

        val failureHandler = KeycloakAuthenticationFailureHandler(
            loginErrorUrl = "${generalProperties.appUrl.trimEnd('/')}/login-error",
            loginUrl = "${generalProperties.appUrl.trimEnd('/')}/auth/login",
        )
        val request = MockHttpServletRequest()
        val response = MockHttpServletResponse()

        failureHandler.onAuthenticationFailure(
            request,
            response,
            OAuth2AuthenticationException(OAuth2Error("authorization_request_not_found")),
        )

        assertEquals("http://192.168.0.228/auth/login", response.redirectedUrl)
    }

    @Test
    fun `authenticationFailureHandler redirects to appUrl auth login on invalid_state_parameter`() {
        val generalProperties = GeneralProperties(
            uuid = "test-uuid",
            enableCsrf = false,
            enableCors = false,
            enableHttps = false,
            markInsteadOfDelete = false,
            appUrl = "http://192.168.0.228",
            externalHelp = null,
            openAIHost = "",
            openAIModel = "",
        )

        val failureHandler = KeycloakAuthenticationFailureHandler(
            loginErrorUrl = "${generalProperties.appUrl.trimEnd('/')}/login-error",
            loginUrl = "${generalProperties.appUrl.trimEnd('/')}/auth/login",
        )
        val request = MockHttpServletRequest()
        val response = MockHttpServletResponse()

        failureHandler.onAuthenticationFailure(
            request,
            response,
            OAuth2AuthenticationException(OAuth2Error("invalid_state_parameter")),
        )

        assertEquals("http://192.168.0.228/auth/login", response.redirectedUrl)
    }

    @Test
    fun `authenticationFailureHandler redirects to login-error on other oauth2 error`() {
        val generalProperties = GeneralProperties(
            uuid = "test-uuid",
            enableCsrf = false,
            enableCors = false,
            enableHttps = false,
            markInsteadOfDelete = false,
            appUrl = "http://192.168.0.228",
            externalHelp = null,
            openAIHost = "",
            openAIModel = "",
        )

        val failureHandler = KeycloakAuthenticationFailureHandler(
            loginErrorUrl = "${generalProperties.appUrl.trimEnd('/')}/login-error",
            loginUrl = "${generalProperties.appUrl.trimEnd('/')}/auth/login",
        )
        val request = MockHttpServletRequest()
        val response = MockHttpServletResponse()

        failureHandler.onAuthenticationFailure(
            request,
            response,
            OAuth2AuthenticationException(OAuth2Error("invalid_client")),
        )

        assertEquals("http://192.168.0.228/login-error", response.redirectedUrl)
    }

    @Test
    fun `authenticationFailureHandler handles appUrl with trailing slash`() {
        val generalProperties = GeneralProperties(
            uuid = "test-uuid",
            enableCsrf = false,
            enableCors = false,
            enableHttps = false,
            markInsteadOfDelete = false,
            appUrl = "http://192.168.0.228/",
            externalHelp = null,
            openAIHost = "",
            openAIModel = "",
        )

        val failureHandler = KeycloakAuthenticationFailureHandler(
            loginErrorUrl = "${generalProperties.appUrl.trimEnd('/')}/login-error",
            loginUrl = "${generalProperties.appUrl.trimEnd('/')}/auth/login",
        )
        val request = MockHttpServletRequest()
        val response = MockHttpServletResponse()

        failureHandler.onAuthenticationFailure(
            request,
            response,
            OAuth2AuthenticationException(OAuth2Error("authorization_request_not_found")),
        )

        assertEquals("http://192.168.0.228/auth/login", response.redirectedUrl)
    }
}
