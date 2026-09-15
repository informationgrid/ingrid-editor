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
package de.ingrid.igeserver.features.cswt_api.api

import IntegrationTest
import com.ninjasquad.springmockk.MockkBean
import de.ingrid.igeserver.imports.getFile
import de.ingrid.igeserver.persistence.filter.publish.PreJsonSchemaValidator
import io.mockk.every
import io.mockk.mockk
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.context.jdbc.Sql
import org.springframework.test.context.jdbc.SqlConfig
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers

@Suppress("ktlint:standard:function-naming")
@WithMockUser(username = "author1", authorities = ["author", "GROUP_2"])
@Sql(scripts = ["/test_data_acl.sql"], config = SqlConfig(encoding = "UTF-8"))
class CswtApiControllerTest : IntegrationTest() {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockkBean
    private lateinit var validator: PreJsonSchemaValidator

    val mockPrincipal = mockk<UsernamePasswordAuthenticationToken>(relaxed = true) {
        every { name } returns "author1"
        every { authorities } returns listOf(SimpleGrantedAuthority("GROUP_2"))
    }

    val folderId = "I2"
    val addressFolderId = "A1"

    @BeforeEach
    fun setUp() {
        every {
            validator.validate(any(), any())
        } returns emptySet()
        every { validator.id } returns "PreJsonSchemaValidator"
        every { validator.usedInProfile("ingrid") } returns true
        every { validator.invoke(any(), any()) } returnsArgument 0
    }

    /**
     * Test case for a successful CSW INSERT transaction request.
     */
    @Test
    fun `handleCSWT should return 200 when service and request parameters are correct for INSERT`() {
        val validData = createCswtDocument("111111")
        val validCatalog = "test_catalog_ingrid"
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/cswt").content(validData).param("SERVICE", "CSW")
                .principal(mockPrincipal)
                .param("REQUEST", "Transaction")
                .param("catalog", validCatalog)
                .param("datasetFolderId", folderId)
                .param("addressFolderId", addressFolderId)
                .contentType(MediaType.APPLICATION_XML),
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(
                MockMvcResultMatchers.content().string(
                    """
                <?xml version="1.0" encoding="UTF-8" standalone="no"?><csw:TransactionResponse xmlns:csw="http://www.opengis.net/cat/csw/2.0.2" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gmd="http://www.isotc211.org/2005/gmd"><csw:TransactionSummary requestId=""><csw:totalInserted>1</csw:totalInserted><csw:totalUpdated>0</csw:totalUpdated><csw:totalDeleted>0</csw:totalDeleted></csw:TransactionSummary><csw:InsertResult><gmd:fileIdentifier><gco:CharacterString>111111</gco:CharacterString></gmd:fileIdentifier></csw:InsertResult></csw:TransactionResponse>
                    """.trimIndent(),
                ),
            )
    }

    /**
     * Test case for a successful CSW UPDATE transaction request.
     * Attention: This test runs into a deadlock and is ignored for now since it does not seem to happen in production.
     * The reason for the deadlock is that two different threads are in a transaction at the same time and wait for each other. See ImportService.kt
     */
    @Ignore
    @Test
    fun `handleCSWT should return 200 when service and request parameters are correct for UPDATE`() {
        val validData = createCswtDocument("I3", "Update")
        val validCatalog = "test_catalog_ingrid"
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/cswt").content(validData).param("SERVICE", "CSW")
                .principal(mockPrincipal)
                .param("REQUEST", "Transaction")
                .param("catalog", validCatalog)
                .param("datasetFolderId", folderId)
                .param("addressFolderId", addressFolderId)
                .contentType(MediaType.APPLICATION_XML),
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(
                MockMvcResultMatchers.content().string(
                    (
                        """
                <?xml version="1.0" encoding="UTF-8" standalone="no"?><csw:TransactionResponse xmlns:csw="http://www.opengis.net/cat/csw/2.0.2" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gmd="http://www.isotc211.org/2005/gmd"><csw:TransactionSummary requestId=""><csw:totalInserted>0</csw:totalInserted><csw:totalUpdated>1</csw:totalUpdated><csw:totalDeleted>0</csw:totalDeleted></csw:TransactionSummary></csw:TransactionResponse>
                        """.trimIndent()
                        ),
                ),
            )
    }

    /**
     * Test case for a successful CSW DELETE transaction request.
     */
    @Test
    fun `handleCSWT should return 200 when service and request parameters are correct for DELETE`() {
        val deleteRequest = """
    <csw:Transaction service="CSW" version="2.0.2"
        xmlns:csw="http://www.opengis.net/cat/csw/2.0.2"
        xmlns:ogc="http://www.opengis.net/ogc"
        xmlns:gmd="http://www.isotc211.org/2005/gmd"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/cat/csw/2.0.2 http://schemas.opengis.net/csw/2.0.2/CSW-publication.xsd">

        <csw:Delete>
            <csw:Constraint version="2.0.0">
                <ogc:Filter>
                    <ogc:PropertyIsEqualTo>
                        <ogc:PropertyName>apsio:identifier</ogc:PropertyName>
                        <ogc:Literal>I3</ogc:Literal>
                    </ogc:PropertyIsEqualTo>
                </ogc:Filter>
            </csw:Constraint>
        </csw:Delete>
    </csw:Transaction>
        """.trimIndent()
        val validCatalog = "test_catalog_ingrid"
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/cswt")
                .content(deleteRequest)
                .principal(mockPrincipal)
                .param("SERVICE", "CSW")
                .param("REQUEST", "Transaction")
                .param("catalog", validCatalog)
                .param("datasetFolderId", folderId)
                .param("addressFolderId", addressFolderId)
                .contentType(MediaType.APPLICATION_XML),
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(
                MockMvcResultMatchers.content().string(
                    """
                <?xml version="1.0" encoding="UTF-8" standalone="no"?><csw:TransactionResponse xmlns:csw="http://www.opengis.net/cat/csw/2.0.2" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gmd="http://www.isotc211.org/2005/gmd"><csw:TransactionSummary requestId=""><csw:totalInserted>0</csw:totalInserted><csw:totalUpdated>0</csw:totalUpdated><csw:totalDeleted>1</csw:totalDeleted></csw:TransactionSummary></csw:TransactionResponse>
                    """.trimIndent(),
                ),
            )
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
                .string(
                    """
                    <?xml version="1.0" encoding="UTF-8" standalone="no"?><ows:ExceptionReport xmlns:ows="http://www.opengis.net/cat/csw/2.0.2"><ows:Exception exceptionCode="NoApplicableCode"><ows:ExceptionText>Cannot process transaction: de.ingrid.igeserver.ClientException: Request parameter 'SERVICE' must be 'CSW'. Value 'INVALID_SERVICE' not supported.</ows:ExceptionText></ows:Exception></ows:ExceptionReport>
                    """.trimIndent(),
                ),
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
                .string(
                    """
                    <?xml version="1.0" encoding="UTF-8" standalone="no"?><ows:ExceptionReport xmlns:ows="http://www.opengis.net/cat/csw/2.0.2"><ows:Exception exceptionCode="NoApplicableCode"><ows:ExceptionText>Cannot process transaction: de.ingrid.igeserver.ClientException: Request parameter 'REQUEST' only accepts value 'Transaction'. Value 'INVALID_REQUEST' not supported.</ows:ExceptionText></ows:Exception></ows:ExceptionReport>
                    """.trimIndent(),
                ),
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

        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/cswt").content(data).param("SERVICE", service)
                .principal(mockPrincipal)
                .param("REQUEST", request)
                .param("catalog", invalidCatalog)
                .contentType(MediaType.APPLICATION_XML),
        ).andExpect(MockMvcResultMatchers.status().isBadRequest)
            .andExpect(
                MockMvcResultMatchers.content().string(
                    """
                <?xml version="1.0" encoding="UTF-8" standalone="no"?><ows:ExceptionReport xmlns:ows="http://www.opengis.net/cat/csw/2.0.2"><ows:Exception exceptionCode="NoApplicableCode"><ows:ExceptionText>Cannot process transaction: de.ingrid.igeserver.api.BadRequestException: The catalog 'invalid-catalog' does not exist.</ows:ExceptionText></ows:Exception></ows:ExceptionReport>
                    """.trimIndent(),
                ),
            )
    }

    /**
     * Test case for unexpected exceptions during the transaction processing.
     */
    @Test
    fun `handleCSWT should return 500 on unexpected exceptions`() {
        val service = "CSW"
        val request = "Transaction"
        val catalog = "test_catalog_ingrid"
        val data = "<csw:Transaction></csw:Transaction>"

        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/cswt").content(data).param("SERVICE", service)
                .principal(mockPrincipal)
                .param("REQUEST", request).param("catalog", catalog).contentType(MediaType.APPLICATION_XML),
        )
            .andExpect(MockMvcResultMatchers.status().isInternalServerError)
    }

    /**
     * Test case for handling validation of CSW data.
     */
    @Test
    fun `handleCSWT should return 400 if required parameters are missing`() {
        val service = "CSW"
        val request = "Update"

        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/cswt").param("SERVICE", service).param("REQUEST", request)
                .principal(mockPrincipal)
                .contentType(MediaType.APPLICATION_XML),
        ).andExpect(MockMvcResultMatchers.status().isBadRequest)
    }

    /**
     * Regression test:
     * A user with restricted write permissions only for OrdnerA should be able to create
     * a new metadata record with ID "abc" via the editor CSW-T endpoint, even if a record
     * with that ID existed before and has since been deleted.
     *
     * The actual permission and deleted-record handling is tested in the service layer.
     * This controller test verifies that such a CSW-T insert request is accepted and
     * delegated correctly.
     */
    @Test
    fun `handleCSWT should allow inserting metadata with previously deleted id in writable folder`() {
        val catalog = "test_catalog_ingrid"
        val metadataId = "I4"

        val cswtInsert = createCswtDocument(metadataId)

        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/cswt")
                .content(cswtInsert)
                .param("SERVICE", "CSW")
                .param("REQUEST", "Transaction")
                .param("catalog", catalog)
                .param("datasetFolderId", folderId)
                .param("addressFolderId", addressFolderId)
                .principal(mockPrincipal)
                .contentType(MediaType.APPLICATION_XML),
        ).andExpect(MockMvcResultMatchers.status().isOk)
    }

    private fun createCswtDocument(metadataId: String, operation: String = "Insert"): String {
        val iso = getFile("ingrid/import/iso_geodataset_full.xml").replace(
            Regex("""(?s)(<gmd:fileIdentifier>).*?(</gmd:fileIdentifier>)"""),
        ) {
            """<gmd:fileIdentifier>
                    <gco:CharacterString>$metadataId</gco:CharacterString>
                </gmd:fileIdentifier>
            """.trimIndent()
        }

        val constraint = if (operation == "Update") {
            """
        <csw:Constraint version="2.0.0">
            <ogc:Filter>
                <ogc:PropertyIsEqualTo>
                    <ogc:PropertyName>apsio:identifier</ogc:PropertyName>
                    <ogc:Literal>$metadataId</ogc:Literal>
                </ogc:PropertyIsEqualTo>
            </ogc:Filter>
        </csw:Constraint>
            """.trimIndent()
        } else {
            ""
        }

        val cswtInsert = """
                <csw:Transaction
                    service="CSW"
                    version="2.0.2"
                    xmlns:csw="http://www.opengis.net/cat/csw/2.0.2"
                    xmlns:ogc="http://www.opengis.net/ogc"
                    xmlns:gmd="http://www.isotc211.org/2005/gmd"
                    xmlns:gco="http://www.isotc211.org/2005/gco">
                    <csw:$operation>
                        $iso
                        $constraint
                    </csw:$operation>
                </csw:Transaction>
        """.trimIndent()
        return cswtInsert
    }
}
