/**
 * ==================================================
 * Copyright (C) 2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.permissions

import IntegrationTest
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.ninjasquad.springmockk.MockkBean
import de.ingrid.igeserver.mail.EmailServiceImpl
import de.ingrid.igeserver.model.CatalogAdmin
import de.ingrid.igeserver.model.User
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import org.springframework.http.MediaType
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Suppress("ktlint:standard:function-naming")
class UserKatAdminTests(val mockMvc: MockMvc) : IntegrationTest() {

    val mockPrincipal = mockk<UsernamePasswordAuthenticationToken>(relaxed = true)

    @MockkBean(relaxed = true)
    lateinit var mail: EmailServiceImpl

    @BeforeEach
    fun beforeTest() {
        clearAllMocks()
        every { mockPrincipal.authorities } returns listOf(SimpleGrantedAuthority("cat-admin"))
        every { mockPrincipal.principal } returns "catadmin1"
        every { mockPrincipal.isAuthenticated } returns true

        // SecurityContext für Tests setzen
        SecurityContextHolder.getContext().authentication = mockPrincipal
    }

    @AfterEach
    fun afterTest() {
        // SecurityContext nach jedem Test leeren
        SecurityContextHolder.clearContext()
    }

    @Test
    fun `cat-admin can create user`() {
        val testUser = User("test-user")
        mockMvc.perform(
            post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jacksonObjectMapper().writeValueAsString(testUser))
                .principal(mockPrincipal),
        )
            .andExpect(status().isOk)
    }

    @Test
    fun `cat-admin can delete user`() {
        mockMvc.perform(
            delete("/api/users/10")
                .principal(mockPrincipal),
        )
            .andExpect(status().isOk)
    }

    @Test
    fun `cat-admin can edit user`() {
        mockMvc.perform(
            put("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jacksonObjectMapper().writeValueAsString(User("test-user")))
                .principal(mockPrincipal),
        )
            .andExpect(status().isOk)
    }

    @Test
    fun `cat-admin can list users`() {
        mockMvc.perform(
            get("/api/users")
                .principal(mockPrincipal),
        )
            .andExpect(status().isOk)
    }

    @Test
    fun `cat-admin can get user`() {
        mockMvc.perform(
            get("/api/users/10").principal(mockPrincipal),
        ).andExpect(status().isOk)
    }

    @Test
    fun `cat-admin gets 404 for fullname if user not found`() {
        mockMvc.perform(
            get("/api/users/99999/fullname").principal(mockPrincipal),
        ).andExpect(status().isNotFound)
    }

    @Test
    fun `cat-admin get fullname if user is found`() {
        mockMvc.perform(
            get("/api/users/10/fullname").principal(mockPrincipal),
        ).andExpect(status().isOk).andExpect { result -> result.response.contentAsString == "???" }
    }

    @Test
    fun `cat-admin get responsibilities`() {
        mockMvc.perform(
            get("/api/users/10/responsibilities").principal(mockPrincipal),
        ).andExpect(status().isOk)
    }

    @Test
    fun `cat-admin can reassign responsibilities`() {
        mockMvc.perform(
            get("/api/users/transferResponsibilities/10/10").principal(mockPrincipal),
        ).andExpect(status().isOk)
    }

    @Test
    fun `cat-admin can list catalog admins`() {
        mockMvc.perform(
            get("/api/users/admins/test_catalog").principal(mockPrincipal),
        ).andExpect(status().isOk)
    }

    @Test
    fun `cat-admin can get current user info`() {
        // userManagementService is mocked in IntegrationTest; stub minimal response
        every { userManagementService.getUser("catadmin1") } returns User(
            login = "catadmin1",
            firstName = "John",
            lastName = "Doe",
            email = "john.doe@example.org",
        )
        mockMvc.perform(
            get("/api/info/currentUser").principal(mockPrincipal),
        ).andExpect(status().isOk)
            .andExpect(jsonPath("$.login").value("catadmin1"))
    }

    @Test
    fun `cat-admin can set catalog admin`() {
        val payload = CatalogAdmin(userIds = listOf("user1"), catalogName = "test_catalog")
        mockMvc.perform(
            post("/api/info/setCatalogAdmin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jacksonObjectMapper().writeValueAsString(payload))
                .principal(mockPrincipal),
        ).andExpect(status().isOk)
    }

    @Test
    fun `cat-admin cannot switch to unassigned catalog`() {
        mockMvc.perform(
            post("/api/user/catalog/test_catalog_2").principal(mockPrincipal),
        ).andExpect(status().isForbidden)
    }

    @Test
    fun `cat-admin can refresh session`() {
        mockMvc.perform(
            get("/api/info/refreshSession").principal(mockPrincipal),
        ).andExpect(status().isOk)
    }

    @Test
    fun `cat-admin can list external users`() {
        mockMvc.perform(
            get("/api/externalUsers").principal(mockPrincipal),
        ).andExpect(status().isOk)
    }

    @Test
    fun `cat-admin can request password change`() {
        mockMvc.perform(
            post("/api/externalUsers/requestPasswordChange/user1").principal(mockPrincipal),
        ).andExpect(status().isOk)
    }

    @Test
    fun `cat-admin can reset password`() {
        mockMvc.perform(
            post("/api/externalUsers/resetPassword/user1").principal(mockPrincipal),
        ).andExpect(status().isOk)
    }

    @Test
    fun `cat-admin can list internal users`() {
        mockMvc.perform(
            get("/api/internalUsers").principal(mockPrincipal),
        ).andExpect(status().isOk)
    }

    @Test
    fun `cat-admin cannot assign user to catalog`() {
        mockMvc.perform(
            post("/api/user/user1/assignCatalog")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jacksonObjectMapper().writeValueAsString("test_catalog_2"))
                .principal(mockPrincipal),
        ).andExpect(status().isForbidden)
    }
}
