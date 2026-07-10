// CswtApiControllerTest.kt
package de.ingrid.igeserver.features.cswt_api.api

import IntegrationTest
import com.ninjasquad.springmockk.MockkBean
import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.api.ImportOptions
import de.ingrid.igeserver.features.cswt_api.services.CSWTransactionResult
import de.ingrid.igeserver.features.cswt_api.services.CswtService
import de.ingrid.igeserver.services.ApiValidationService
import io.kotest.core.annotation.Ignored
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.assertThrows
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers

@WithMockUser(username = "user1", authorities = ["cat-admin"])
@Ignored
class CswtApiControllerTest : IntegrationTest() {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockkBean
    private lateinit var apiValidationService: ApiValidationService

    @MockkBean
    private lateinit var ogcCswtService: CswtService

    val mockPrincipal = mockk<UsernamePasswordAuthenticationToken>(relaxed = true)

    /**
     * Test case for a successful CSW transaction request.
     */
    @Test
    fun `handleCSWT should return 200 when service and request parameters are correct`() {
        val validData = "<csw:Transaction></csw:Transaction>"
        val validCatalog = "valid-catalog"
        val transactionResult = CSWTransactionResult(successful = true)
        every {
            ogcCswtService.cswTransaction(
                validData,
                validCatalog,
                mockPrincipal,
                any(),
            )
        } returns transactionResult

        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/cswt").content(validData).param("SERVICE", "CSW")
                .principal(mockPrincipal)
                .param("REQUEST", "Transaction").param("catalog", validCatalog)
                .contentType(MediaType.APPLICATION_XML),
        ).andExpect(MockMvcResultMatchers.status().isOk)
    }

    /**
     * Test case for an invalid 'SERVICE' parameter.
     */
    @Test
    fun `handleCSWT should return 400 when SERVICE parameter is invalid`() {
        val invalidService = "INVALID_SERVICE"
        val catalog = "valid-catalog"
        val request = "Transaction"
        val data = "<csw:Transaction></csw:Transaction>"

        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/cswt").content(data).param("SERVICE", invalidService)
                .principal(mockPrincipal)
                .param("REQUEST", request).param("catalog", catalog).contentType(MediaType.APPLICATION_XML),
        ).andExpect(MockMvcResultMatchers.status().isBadRequest).andExpect(
            MockMvcResultMatchers.content()
                .string("Request parameter 'SERVICE' must be 'CSW'. Value '$invalidService' not supported."),
        )
    }

    /**
     * Test case for an invalid 'REQUEST' parameter.
     */
    @Test
    fun `handleCSWT should return 400 when REQUEST parameter is invalid`() {
        val service = "CSW"
        val invalidRequest = "INVALID_REQUEST"
        val catalog = "valid-catalog"
        val data = "<csw:Transaction></csw:Transaction>"

        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/cswt").content(data).param("SERVICE", service)
                .principal(mockPrincipal)
                .param("REQUEST", invalidRequest).param("catalog", catalog).contentType(MediaType.APPLICATION_XML),
        ).andExpect(MockMvcResultMatchers.status().isBadRequest).andExpect(
            MockMvcResultMatchers.content()
                .string("Request parameter 'REQUEST' only accepts value 'Transaction'. Value '$invalidRequest' not supported."),
        )
    }

    /**
     * Test case for validation errors in catalog parameter.
     */
    @Test
    fun `handleCSWT should return 400 if catalog is invalid`() {
        val service = "CSW"
        val request = "Transaction"
        val invalidCatalog = "invalid-catalog"
        val data = "<csw:Transaction></csw:Transaction>"

        assertThrows<ClientException> {
            apiValidationService.validateCollection(invalidCatalog)
        }

        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/cswt").content(data).param("SERVICE", service)
                .principal(mockPrincipal)
                .param("REQUEST", request).param("catalog", invalidCatalog).contentType(MediaType.APPLICATION_XML),
        ).andExpect(MockMvcResultMatchers.status().isBadRequest)
            .andExpect(MockMvcResultMatchers.content().string("Invalid catalog parameter"))
    }

    /**
     * Test case for unexpected exceptions during the transaction processing.
     */
    @Test
    fun `handleCSWT should return 500 on unexpected exceptions`() {
        val service = "CSW"
        val request = "Transaction"
        val catalog = "valid-catalog"
        val data = "<csw:Transaction></csw:Transaction>"

        assertThrows<RuntimeException> {
            ogcCswtService.cswTransaction(
                data,
                catalog,
                mockPrincipal,
                ImportOptions(),
            )
        }

        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/cswt").content(data).param("SERVICE", service)
                .principal(mockPrincipal)
                .param("REQUEST", request).param("catalog", catalog).contentType(MediaType.APPLICATION_XML),
        ).andExpect(MockMvcResultMatchers.status().isInternalServerError)
            .andExpect(MockMvcResultMatchers.content().string("Unexpected error"))
    }

    /**
     * Test case for handling validation of CSW data.
     */
    @Test
    fun `handleCSWT should return 400 if required parameters are missing`() {
        val service = "CSW"
        val request = "Update"
        val catalog = ""

        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/cswt").param("SERVICE", service).param("REQUEST", request)
                .principal(mockPrincipal)
                .contentType(MediaType.APPLICATION_XML),
        ).andExpect(MockMvcResultMatchers.status().isBadRequest)
    }
}
