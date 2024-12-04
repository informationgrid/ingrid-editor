package de.ingrid.igeserver.research

import de.ingrid.igeserver.model.ResearchPaging
import de.ingrid.igeserver.services.IgeAclService
import de.ingrid.igeserver.services.ResearchService
import de.ingrid.igeserver.utils.AuthUtils
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.matchers.shouldBe
import io.mockk.CapturingSlot
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import jakarta.persistence.EntityManager
import jakarta.persistence.Tuple
import org.hibernate.sql.results.internal.TupleElementImpl
import org.hibernate.sql.results.internal.TupleImpl
import org.hibernate.sql.results.internal.TupleMetadata
import org.junit.jupiter.api.Assertions.assertNotNull
import org.springframework.security.core.Authentication
import java.time.Instant

class QuerySqlTest : AnnotationSpec() {

    private lateinit var authUtils: AuthUtils
    private lateinit var acl: IgeAclService
    private lateinit var em: EntityManager
    private lateinit var service: ResearchService

    private val defaultColumns =
        """document_wrapper.id as wrapperid, document_wrapper.tags as tags, document_wrapper.responsible_user as responsibleUser,document_wrapper.category,document_wrapper.deleted,document_wrapper.catalog_idaswrapper_catalog_id, 
            document1.uuid,document1.title,document1.type,document1.created,document1.modified,document1.contentmodified,document1.state,document1.catalog_id,document1.is_latest"""

    private val outerSelection =
        """SELECT sql_query.* FROM sql_query, catalog WHERE sql_query.catalog_id = catalog.id AND sql_query.wrapper_catalog_id=catalog.id AND catalog.identifier = 'testCatalogId' AND deleted = 0 AND is_latest = true"""

    private val principal = mockk<Authentication>(relaxed = true)
    private val catalogId = "testCatalogId"

    @BeforeEach
    fun setUp() {
        em = mockk<EntityManager>(relaxed = true)
        acl = mockk<IgeAclService>(relaxed = true)
        authUtils = mockk<AuthUtils>()
        service = ResearchService(em, emptyList(), emptyList(), acl, authUtils)

        every { authUtils.isAdmin(any()) } returns (true)
    }

    @Test
    fun `sql search with empty result`() {
        val slot = slot<String>()
        val sqlQuery = "SELECT test_column FROM test_table"

        every { em.createNativeQuery(capture(slot), Tuple::class.java).resultList } returns (emptyList<List<Tuple>>())

        val expectedSql = """WITH sql_query AS ( SELECT $defaultColumns,test_column FROM test_table ) $outerSelection"""

        val response = service.querySql(principal, catalogId, sqlQuery, ResearchPaging())
        assertNotNull(response)
        response.totalHits shouldBe 0
        compareSql(slot.captured, expectedSql)
    }

    @Test
    fun `sql search with a result`() {
        val slot = slot<String>()
        val sqlQuery = "SELECT test_column FROM test_table"

        mockNativeQueryResults(slot, 1)

        val response = service.querySql(principal, catalogId, sqlQuery, ResearchPaging())
        assertNotNull(response)
        response.totalHits shouldBe 1
    }

    @Test
    fun `sql search with complex query`() {
        val slot = slot<String>()
        val sqlQuery = """WITH filtered_documents AS (SELECT document1.*, document1.data, document_wrapper.category
        FROM document_wrapper
                JOIN document document1 ON document_wrapper.uuid = document1.uuid
        WHERE document1.is_latest = true
        AND document_wrapper.deleted = 0
        AND jsonb_path_exists(jsonb_strip_nulls(document1.data),
        '$.service.coupledResources')
        AND jsonb_path_exists(jsonb_strip_nulls(document1.data),
        '$.service.operations'))
        SELECT DISTINCT fd.*
        FROM filtered_documents fd
        JOIN LATERAL jsonb_array_elements(fd.data -> 'service' -> 'coupledResources') AS cr(s) ON true
        JOIN LATERAL jsonb_array_elements(fd.data -> 'service' -> 'operations') AS o ON true
        WHERE cr.s ->> 'uuid' = '12345'
        AND o -> 'name' ->> 'key' = '1'
        """

        every { em.createNativeQuery(capture(slot), Tuple::class.java).resultList } returns (emptyList<List<Tuple>>())

        val expectedSql =
            """WITH sql_query AS (WITH filtered_documents AS (SELECT $defaultColumns, document1.data, document_wrapper.category
                                             FROM document_wrapper
                                                    JOIN document document1 ON document_wrapper.uuid = document1.uuid
                                             WHERE document1.is_latest = true
                                               AND document_wrapper.deleted = 0
                                               AND jsonb_path_exists(jsonb_strip_nulls(document1.data),
                                                                     '${'$'}.service.coupledResources')
                                               AND jsonb_path_exists(jsonb_strip_nulls(document1.data),
                                                                     '${'$'}.service.operations'))
                 SELECT DISTINCT fd.*
                 FROM filtered_documents fd
                        JOIN LATERAL jsonb_array_elements(fd.data -> 'service' -> 'coupledResources') AS cr(s) ON true
                        JOIN LATERAL jsonb_array_elements(fd.data -> 'service' -> 'operations') AS o ON true
                 WHERE cr.s ->> 'uuid' = '12345'
                   AND o -> 'name' ->> 'key' = '1') $outerSelection"""

        service.querySql(principal, catalogId, sqlQuery, ResearchPaging())
        compareSql(slot.captured, expectedSql)
    }

    private fun mockNativeQueryResults(slot: CapturingSlot<String>, count: Int) {
        every {
            em.createNativeQuery(capture(slot), Tuple::class.java).setFirstResult(any()).setMaxResults(any()).resultList
        } returns
            createTupleList(count)
    }

    private fun compareSql(actual: String, expected: String) = actual.trim().replace(" ", "").replace("\n", "") shouldBe expected.trim().replace(" ", "").replace("\n", "")

    private fun createTupleList(count: Int): List<Tuple> {
        if (count == 0) return emptyList()

        val metadata = TupleMetadata(
            arrayOf(
                TupleElementImpl(Int::class.java, "wrapperid"),
                TupleElementImpl(String::class.java, "title"),
                TupleElementImpl(String::class.java, "uuid"),
                TupleElementImpl(String::class.java, "type"),
                TupleElementImpl(Instant::class.java, "created"),
                TupleElementImpl(Instant::class.java, "contentModified"),
                TupleElementImpl(String::class.java, "state"),
                TupleElementImpl(String::class.java, "category"),
                TupleElementImpl(Array::class.java, "tags"),
                TupleElementImpl(String::class.java, "responsibleUser"),
            ),
            arrayOf(
                "wrapperid",
                "title",
                "uuid",
                "type",
                "created",
                "contentModified",
                "state",
                "category",
                "tags",
                "responsibleUser",
            ),
        )

        return (1..count).map {
            TupleImpl(
                metadata,
                arrayOf(
                    123 + it,
                    "Titel $it",
                    "uuid$it",
                    "type$it",
                    Instant.now(),
                    Instant.now(),
                    "DRAFT",
                    "category$it",
                    emptyList<String>(),
                    "responsibleUser$it",
                ),
            )
        }
    }
}
