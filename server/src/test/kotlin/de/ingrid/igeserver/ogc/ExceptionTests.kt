package de.ingrid.igeserver.ogc

import IntegrationTest
import com.ninjasquad.springmockk.MockkBean
import de.ingrid.igeserver.exports.ingrid.exportJsonToJson
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIDFExporter
import de.ingrid.igeserver.services.*
import io.mockk.every
import io.mockk.mockk
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultHandlers.print
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

class ExceptionTests : IntegrationTest() {

    val mockPrincipal = mockk<UsernamePasswordAuthenticationToken>(relaxed = true)

    @MockkBean(relaxed = true)
    private lateinit var catalogService: CatalogService

    @MockkBean(relaxed = true)
    private lateinit var documentService: DocumentService

    @MockkBean(relaxed = true)
    private lateinit var exportService: ExportService

    @MockkBean(relaxed = true)
    private lateinit var exporter: IngridIDFExporter

//    private val catalogService = mockk<CatalogService>()

    val ogcRecordService = mockk<OgcRecordService>()


    @Autowired
    lateinit var mockMvc: MockMvc

    @Before
    fun beforeTest() {
        every {
            mockPrincipal.authorities
        }.returns(listOf(SimpleGrantedAuthority("cat-admin")))
        every {
            mockPrincipal.principal
        }.returns("user1")

//        mockCatalog(catalogService)
//        val addresses = listOf(
//                MockDocument(
//                        1638,
//                        "25d56d6c-ed8d-4589-8c14-f8cfcb669115",
//                        "/export/ingrid/address.organisation.sample.json",
//                        type = "InGridOrganisationDoc"
//                ),
//                MockDocument(
//                        1634,
//                        "14a37ded-4ca5-4677-bfed-3607bed3071d",
//                        "/export/ingrid/address.person.sample.json",
//                        1638
//                ),
//                MockDocument(
//                        1652,
//                        "fc521f66-0f47-45fb-ae42-b14fc669942e",
//                        "/export/ingrid/address.person2.sample.json",
//                        1638
//                )
//        )
//
//        val datasets = listOf(
//                MockDocument(
//                        uuid = "a910fde0-3910-413e-9c14-4fa86f3d12c2",
//                        template = "/export/ingrid/geo-dataset.maximal.sample.json"
//                ),
//                MockDocument(uuid = "93CD0919-5A2F-4286-B731-645C34614AA1")
//        )
//
//        initDocumentMocks(addresses + datasets, documentService)
    }


//    @Test
//    fun getCollectionByNonExistingId() {
//        every { catalogService.getCatalogById("no-can-do") } throws Exception()
//        mockMvc.perform(get("/collections/no-can-do").principal(mockPrincipal))
//                .andDo(print())
//                .andExpect(status().isNotFound)
//    }

//    @Test
//    fun getCollection() {
//        mockMvc.perform(get("/collections/test-catalog").principal(mockPrincipal))
//            .andDo(print())
//            .andExpect(status().isOk)
//    }

    //
//    @Test
//    fun getCollectionNonExistingExporter() {
//
//    }


    @Test
    fun getRecord() {
        val result = exportJsonToJson(exporter, "/export/ingrid/data-collection.sample.maximal.json")
//        every { ogcRecordService.prepareRecord("test-catalog", "93CD0919-5A2F-4286-B731-645C34614AA1", "application/json") } returns Pair(result.toByteArray(), "application/json")

        every { exportService.export("a910fde0-3910-413e-9c14-4fa86f3d12c2", any())} returns ExportResult(result.toByteArray(), "filename", exportFormat = MediaType.valueOf("application/json") )
        mockMvc.perform(get("/collections/test-catalog/items/a910fde0-3910-413e-9c14-4fa86f3d12c2").principal(mockPrincipal))
                .andDo(print())
                .andExpect(status().isOk)
    }


}