package de.ingrid.igeserver.ogc

import de.ingrid.igeserver.IgeServer
import org.apache.http.HttpResponse
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.TestPropertySource
import org.springframework.test.context.jdbc.Sql
import org.springframework.test.context.jdbc.SqlConfig
import java.io.IOException


class ExceptionTests {

    @Autowired
    private val utils: IntegrationTestUtils = IntegrationTestUtils()

    @Autowired
    private val testUtils: TestUtils = TestUtils()


//    @BeforeEach
//    @Throws(IOException::class)
//    fun initialize() {
//        // ensure index is empty
//        val query: Query = getBuilderWithMatchAllQuery().build()
//        val numDocuments: Long = operations.count(query, Any::class.java, IndexCoordinates.of(testIndex))
//        org.junit.Assert.assertEquals(0, numDocuments)
//        // ensure basic collection is in DB
//        val payload: String = readXml("integration", "collection", "payload", "correct")
//        val responsePost = utils.post("/collections/$collectionId", payload, "application/rdf+xml")
//        org.junit.Assert.assertEquals(200, responsePost!!.statusLine.statusCode.toLong())
//    }


    @Throws(IOException::class)
    private fun validRecordPayload(): String? {
        return testUtils.readXml("ogc", "internal", "singleRecord", extension = "json")
    }

    @DisplayName("POST valid Record to non-existing collection")
    @Test
    @Throws(IOException::class)
    fun postRecordIfCollectionMissing() {
        val nonExistingCollectionId = "no-can-do"
        val response: HttpResponse? = utils.post("/collections/$nonExistingCollectionId/items", validRecordPayload(), "application/json")
        assertEquals(404, response?.statusLine?.statusCode?.toLong())
    }

    @DisplayName("POST valid Record to existing collection")
    @Test
    @Throws(IOException::class)
    fun postRecordIfCollectionPresent() {
        val collectionId = "ogctestcatalog"
        val response: HttpResponse? = utils.post("/collections/$collectionId/items", validRecordPayload(), "application/json")
        assertEquals(200, response?.statusLine?.statusCode?.toLong())
    }


}