package de.ingrid.igeserver.api

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ObjectNode
import com.orientechnologies.orient.core.db.OrientDB
import de.ingrid.igeserver.persistence.DBApi
import de.ingrid.igeserver.persistence.model.document.DocumentType
import de.ingrid.igeserver.persistence.model.document.DocumentWrapperType
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.utils.AuthUtils
import de.ingrid.igeserver.services.CatalogService
import org.junit.*
import org.mockito.*
import java.io.IOException
import java.util.*

@Ignore("Test needs to be migrated. Should we still write these tests, when we have e2e tests?")
class DatasetApiTest {
    @Mock
    private val authUtils: AuthUtils? = null

    @Mock
    private val catalogService: CatalogService? = null

    @Spy
    private val dbService: DBApi? = null

    @Mock
    private val documentService: DocumentService? = null

    @Before
    @Throws(ApiException::class)
    fun prepare() {
        MockitoAnnotations.initMocks(this)
        Mockito.`when`(authUtils!!.getUsernameFromPrincipal(ArgumentMatchers.any())).thenReturn("user1")
        val dbIds = HashSet<String>()
        dbIds.add("test")

        //dbUtils = new DBUtils(dbService);
        Mockito.`when`(catalogService!!.getCatalogsForUser("user1")).thenReturn(dbIds)
    }

    @Test
    @Throws(ApiException::class, IOException::class)
    fun createDataset() {
        val controller = DatasetsApiController(authUtils!!, catalogService!!, dbService!!, documentService!!)
        val node = ObjectMapper().createObjectNode()
        node.put("title", "Document 1")
        controller.createDataset(null, node, false, false)

        // ASSERTIONS
        val arg = ArgumentCaptor.forClass(String::class.java)
        val arg2 = ArgumentCaptor.forClass(String::class.java)
        Mockito.verify(dbService).save(ArgumentMatchers.eq(DocumentType::class), ArgumentMatchers.any(), arg.capture())
        val jsonNode = ObjectMapper().readTree(arg.value) as ObjectNode
        Assert.assertTrue(jsonNode["_id"].asText().isNotEmpty())
        jsonNode.remove("_id")
        Assert.assertEquals("""{
  "uuid": "123",
  "title": "Document 1"
}""", jsonNode.toString())
        Mockito.verify(dbService).save(ArgumentMatchers.eq(DocumentWrapperType::class), ArgumentMatchers.any(), arg2.capture())
        val jsonNode2 = ObjectMapper().readTree(arg.value) as ObjectNode
        Assert.assertTrue(jsonNode2["_id"].asText().isNotEmpty())
        jsonNode2.remove("_id")
        Assert.assertEquals("""{
  "_id": "2",
  "_parent": null,
  "_hasChildren":false,
  "draft": "123",
  "published": null,
  "archive": []
}""", jsonNode2.toString())
    }

    companion object {
        private val db: OrientDB? = null

        @BeforeClass
        fun before() {

            /*db = new OrientDB("memory:test", OrientDBConfig.defaultConfig());

        db.create("test", ODatabaseType.MEMORY);

        ODatabaseSession testDB = db.open("test", "admin", "admin");

        testDB.getMetadata().getSchema().createClass("Documents");
        testDB.commit();

        OrientDBDatabase orientDBDatabase = new OrientDBDatabase();
        orientDBDatabase.*/
        }
    }
}