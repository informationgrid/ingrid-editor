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
package de.ingrid.igeserver.api

import com.nimbusds.jose.JWSAlgorithm
import com.nimbusds.jose.JWSHeader
import com.nimbusds.jose.crypto.MACSigner
import com.nimbusds.jwt.JWTClaimsSet
import com.nimbusds.jwt.SignedJWT
import de.ingrid.igeserver.services.BehaviourService
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import jakarta.servlet.http.HttpServletRequest
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken
import org.springframework.security.oauth2.client.web.OAuth2AuthorizedClientRepository
import org.springframework.security.oauth2.core.OAuth2RefreshToken
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.test.util.ReflectionTestUtils
import java.time.Instant
import java.util.Date

class UsersApiControllerTest : AnnotationSpec() {

    private lateinit var controller: UsersApiController
    private lateinit var authorizedClientRepository: OAuth2AuthorizedClientRepository
    private lateinit var httpServletRequest: HttpServletRequest
    private lateinit var behaviourService: BehaviourService

    @BeforeEach
    fun setup() {
        behaviourService = mockk(relaxed = true)
        authorizedClientRepository = mockk(relaxed = true)
        httpServletRequest = mockk(relaxed = true)

        controller = UsersApiController(behaviourService)
        ReflectionTestUtils.setField(controller, "authorizedClientRepository", authorizedClientRepository)
        ReflectionTestUtils.setField(controller, "httpServletRequest", httpServletRequest)
    }

    @Test
    fun `refreshSession returns total and remaining from OAuth2RefreshToken timestamps`() {
        val now = Instant.now()
        val issuedAt = now.minusSeconds(300)
        val expiresAt = now.plusSeconds(900)
        val expectedTotal = 1200L

        val refreshToken = OAuth2RefreshToken("dummy-token", issuedAt, expiresAt)
        val authorizedClient = mockk<OAuth2AuthorizedClient>()
        every { authorizedClient.refreshToken } returns refreshToken

        val auth = mockk<OAuth2AuthenticationToken>(relaxed = true)
        every { auth.authorizedClientRegistrationId } returns "keycloak"
        every { auth.principal } returns mockk(relaxed = true)
        every { authorizedClientRepository.loadAuthorizedClient<OAuth2AuthorizedClient>("keycloak", auth, httpServletRequest) } returns authorizedClient

        val response = controller.refreshSession(auth)
        response.body?.get("total") shouldBe expectedTotal
        val remaining = response.body?.get("remaining") ?: 0L
        (remaining in 890L..900L) shouldBe true
    }

    @Test
    fun `refreshSession decodes SignedJWT in refresh token when token timestamps are missing`() {
        val now = Instant.now()
        val issuedAtDate = Date.from(now.minusSeconds(600))
        val expiresAtDate = Date.from(now.plusSeconds(1800))
        val expectedTotal = 2400L

        val claimsSet = JWTClaimsSet.Builder()
            .issueTime(issuedAtDate)
            .expirationTime(expiresAtDate)
            .build()
        val signedJWT = SignedJWT(JWSHeader(JWSAlgorithm.HS256), claimsSet)
        signedJWT.sign(MACSigner("01234567890123456789012345678901"))
        val tokenValue = signedJWT.serialize()

        val refreshToken = OAuth2RefreshToken(tokenValue, null, null)
        val authorizedClient = mockk<OAuth2AuthorizedClient>()
        every { authorizedClient.refreshToken } returns refreshToken

        val auth = mockk<OAuth2AuthenticationToken>(relaxed = true)
        every { auth.authorizedClientRegistrationId } returns "keycloak"
        every { auth.principal } returns mockk(relaxed = true)
        every { authorizedClientRepository.loadAuthorizedClient<OAuth2AuthorizedClient>("keycloak", auth, httpServletRequest) } returns authorizedClient

        val response = controller.refreshSession(auth)
        response.body?.get("total") shouldBe expectedTotal
        val remaining = response.body?.get("remaining") ?: 0L
        (remaining in 1790L..1800L) shouldBe true
    }

    @Test
    fun `refreshSession falls back to OidcUser when no authorized client is available`() {
        val now = Instant.now()
        val issuedAt = now.minusSeconds(100)
        val expiresAt = now.plusSeconds(500)
        val expectedTotal = 600L

        val oidcUser = mockk<OidcUser>()
        every { oidcUser.issuedAt } returns issuedAt
        every { oidcUser.expiresAt } returns expiresAt

        val auth = mockk<OAuth2AuthenticationToken>()
        every { auth.authorizedClientRegistrationId } returns "keycloak"
        every { auth.principal } returns oidcUser
        every { authorizedClientRepository.loadAuthorizedClient<OAuth2AuthorizedClient>("keycloak", auth, httpServletRequest) } returns null

        val response = controller.refreshSession(auth)
        response.body?.get("total") shouldBe expectedTotal
        val remaining = response.body?.get("remaining") ?: 0L
        (remaining in 490L..500L) shouldBe true
    }
}
