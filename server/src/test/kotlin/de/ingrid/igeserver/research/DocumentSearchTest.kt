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
package de.ingrid.igeserver.research

import IntegrationTest
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.model.TitleOrUuidSearchRequest
import de.ingrid.igeserver.services.DocumentSearchService
import io.kotest.matchers.shouldBe
import jakarta.persistence.EntityManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.transaction.annotation.Transactional

@Transactional
class DocumentSearchTest : IntegrationTest() {
    @Autowired
    private lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var service: DocumentSearchService

    private val admin = user("ROLE_cat-admin")
    private val reader = user("GROUP_READTREE")
    private val denied = user("GROUP_NO_ACCESS")
    private var nextId = 10000
    private val mapper = jacksonObjectMapper()

    @Test
    fun `search values stay data and LIKE wildcards remain supported`() {
        val title = "Search O'Brien 100% a_b C:\\maps"
        addDocument("literal", title)
        addDocument("other", "Search unrelated")
        search("O'Brien").hits.map { it.uuid } shouldBe listOf("literal")
        search("' OR 1=1 --").totalHits shouldBe 0
        search("'; SELECT * FROM catalog; --").totalHits shouldBe 0
        search("Search O%").hits.map { it.uuid } shouldBe listOf("literal")
        search("a_b").hits.map { it.uuid } shouldBe listOf("literal")
        search("100\\%").hits.map { it.uuid } shouldBe listOf("literal")
        search("a\\_b").hits.map { it.uuid } shouldBe listOf("literal")
        search("C:\\\\maps").hits.map { it.uuid } shouldBe listOf("literal")
        search(" O'Brien ").totalHits shouldBe 1
        search("  O'Brien  ").totalHits shouldBe 0
    }

    @Test
    fun `UUID matches are exact and do not search document JSON`() {
        addDocument("Exact-UUID", "Unrelated", data = """{"description":"HiddenTerm"}""")
        search("Exact-UUID").hits.map { it.uuid } shouldBe listOf("Exact-UUID")
        search("exact-uuid").totalHits shouldBe 0
        search("Exact-%").totalHits shouldBe 0
        search("HiddenTerm").totalHits shouldBe 0
    }

    @Test
    fun `category folders archives deletion and versions are respected`() {
        addDocument("data", "Search data")
        addDocument("address", "Search address", category = "address")
        addDocument("folder", "Search folder", type = "FOLDER")
        addDocument("archived", "Search archived", archived = true)
        addDocument("deleted", "Search deleted", deleted = true)
        addDocument("foreign", "Search foreign", catalog = 101)
        addDocument("versioned", "Search latest")
        addVersion("versioned", "Search old", latest = false)

        search("Search").hits.map { it.uuid } shouldBe listOf("data", "folder", "versioned")
        service.findInTitleOrUuid("test_catalog", admin, TitleOrUuidSearchRequest("Search", excludeFolders = true))
            .hits.map { it.uuid } shouldBe listOf("data", "versioned")
        service.findInTitleOrUuid("test_catalog", admin, TitleOrUuidSearchRequest("Search", category = "address"))
            .hits.map { it.uuid } shouldBe listOf("address")
        search("Search old").totalHits shouldBe 0
    }

    @Test
    fun `empty search works and paging uses a stable title UUID order`() {
        addDocument("b", "Search same", category = "address")
        addDocument("a", "Search same", category = "address")
        val response = service.findInTitleOrUuid(
            "test_catalog",
            admin,
            TitleOrUuidSearchRequest("Search", category = "address", pageSize = 1),
        )
        response.totalHits shouldBe 2
        response.hits.map { it.uuid } shouldBe listOf("a")
        service.findInTitleOrUuid(
            "test_catalog",
            admin,
            TitleOrUuidSearchRequest("", category = "address", excludeFolders = true, pageSize = 1),
        ).totalHits shouldBe 3
    }

    @Test
    fun `catalog is bound and joins cannot mix catalogs with equal UUIDs`() {
        addDocument("shared", "Search local")
        addDocument("shared", "Search foreign", catalog = 101)
        search("Search").hits.map { it.title } shouldBe listOf("Search local")
        service.findInTitleOrUuid("test_catalog' OR '1'='1", admin, TitleOrUuidSearchRequest("")).totalHits shouldBe 0
    }

    @Test
    fun `ACL filtering happens before counting and limiting and preserves read only permissions`() {
        // These wrappers already have real ACLs in test_data_acl.sql.
        addVersion("c689240d-e7a9-45cc-b761-44eda0cda1f1", "Search A denied")
        addVersion("8f891e4e-161e-4d2c-6869-03f02ab352dc", "Search B allowed")
        addVersion("7289c68d-f036-4d61-932c-855ac408bde1", "Search C allowed")
        val response = service.findInTitleOrUuid("test_catalog", reader, TitleOrUuidSearchRequest("Search", pageSize = 1))
        response.totalHits shouldBe 2
        response.hits.map { it.title } shouldBe listOf("Search B allowed")
        response.hits.single().hasWritePermission shouldBe false
        response.hits.single().hasOnlySubtreeWritePermission shouldBe false
        service.findInTitleOrUuid("test_catalog", denied, TitleOrUuidSearchRequest("Search")).totalHits shouldBe 0
    }

    @Test
    fun `coupled service needs resource and operation in the same latest document`() {
        val uuid = "resource' OR 1=1 --"
        addDocument("resources-only", "Search resource", data = serviceData(uuid, "2"))
        addDocument("operations-only", "Search operation", data = serviceData("another"))
        addDocument("missing", "Search missing")
        addDocument("nulls", "Search nulls", data = """{"service":{"coupledResources":null,"operations":[]}}""")
        addDocument("wrong-shape", "Search malformed", data = """{"service":{"coupledResources":{},"operations":false}}""")
        addDocument("old", "Search new")
        addVersion("old", "Search old", data = serviceData(uuid), latest = false)
        addDocument("foreign-service", "Search foreign", data = serviceData(uuid), catalog = 101)
        addDocument("deleted-service", "Search deleted", data = serviceData(uuid), deleted = true)
        service.hasCoupledServiceWithGetCapabilities("test_catalog", admin, uuid) shouldBe false

        addDocument("match", "Search match", data = serviceData(uuid), archived = true)
        service.hasCoupledServiceWithGetCapabilities("test_catalog", admin, uuid) shouldBe true
        service.hasCoupledServiceWithGetCapabilities("test_catalog", admin, "' OR 1=1 --") shouldBe false
        service.hasCoupledServiceWithGetCapabilities("test_catalog", denied, uuid) shouldBe false
    }

    @Test
    fun `existence search continues past an unreadable service`() {
        addVersion("c689240d-e7a9-45cc-b761-44eda0cda1f1", "Search A denied", data = serviceData("target"))
        service.hasCoupledServiceWithGetCapabilities("test_catalog", reader, "target") shouldBe false
        addVersion("8f891e4e-161e-4d2c-6869-03f02ab352dc", "Search B allowed", data = serviceData("target"))
        service.hasCoupledServiceWithGetCapabilities("test_catalog", reader, "target") shouldBe true
    }

    @Test
    fun `HmbTG uses latest properties keeps archived titles and deduplicates only UUIDs`() {
        val published = """{"properties":{"publicationHmbTG":true}}"""
        addDocument("one", "Same title", data = published)
        addDocument("two", "Same title", data = published, archived = true)
        addDocument("false", "False", data = """{"properties":{"publicationHmbTG":false}}""")
        addDocument("missing", "Missing")
        addDocument("old", "New", data = "{}")
        addVersion("old", "Old published", data = published, latest = false)
        addDocument("deleted", "Deleted", data = published, deleted = true)
        addDocument("foreign", "Foreign", data = published, catalog = 101)
        val uuids = listOf("one", "one", "two", "false", "missing", "old", "deleted", "foreign", "' OR 1=1 --")
        service.getHmbtgDocumentTitles("test_catalog", admin, uuids) shouldBe listOf("Same title", "Same title")
        service.getHmbtgDocumentTitles("test_catalog", denied, uuids) shouldBe emptyList()
        service.getHmbtgDocumentTitles("test_catalog", admin, emptyList()) shouldBe emptyList()
    }

    @Test
    fun `root read access does not become write access`() {
        val response = service.findInTitleOrUuid(
            "test_catalog",
            user("SPECIAL_read_root"),
            TitleOrUuidSearchRequest("5d2ff598-45fd-4516-b843-0b1787bd8264"),
        )
        response.totalHits shouldBe 1
        response.hits.single().hasWritePermission shouldBe false
    }

    @Test
    fun `HmbTG only returns titles readable through the ACL`() {
        val allowedUuid = "8f891e4e-161e-4d2c-6869-03f02ab352dc"
        val deniedUuid = "c689240d-e7a9-45cc-b761-44eda0cda1f1"
        val data = """{"properties":{"publicationHmbTG":true}}"""
        addVersion(deniedUuid, "Search A denied", data)
        addVersion(allowedUuid, "Search B allowed", data)
        service.getHmbtgDocumentTitles("test_catalog", reader, listOf(deniedUuid, allowedUuid)) shouldBe listOf("Search B allowed")
    }

    @Test
    fun `HmbTG list is bound without array literal parsing and has no implicit page limit`() {
        val uuids = (1..12).map { "uuid,'{}\\$it" }
        uuids.forEach { addDocument(it, "Same title", data = """{"properties":{"publicationHmbTG":true}}""") }
        service.getHmbtgDocumentTitles("test_catalog", admin, uuids).size shouldBe 12
    }

    private fun search(term: String) = service.findInTitleOrUuid("test_catalog", admin, TitleOrUuidSearchRequest(term))

    private fun serviceData(uuid: String, operation: String = "1"): String = mapper.writeValueAsString(
        mapOf("service" to mapOf("coupledResources" to listOf(mapOf("uuid" to uuid)), "operations" to listOf(mapOf("name" to mapOf("key" to operation))))),
    )

    private fun addDocument(
        uuid: String,
        title: String,
        category: String = "data",
        type: String = "InGridGeoDataset",
        data: String = "{}",
        catalog: Int = 100,
        archived: Boolean = false,
        deleted: Boolean = false,
    ) {
        entityManager.createNativeQuery(
            """INSERT INTO document_wrapper (id, catalog_id, uuid, type, category, deleted, tags)
               VALUES (:id, :catalog, :uuid, :type, :category, :deleted, CAST(:tags AS text[]))""",
        ).setParameter("id", nextId++).setParameter("catalog", catalog).setParameter("uuid", uuid)
            .setParameter("type", type).setParameter("category", category).setParameter("deleted", if (deleted) 1 else 0)
            .setParameter("tags", if (archived) "{archived}" else "{}").executeUpdate()
        addVersion(uuid, title, data, catalog, type = type)
    }

    private fun addVersion(
        uuid: String,
        title: String,
        data: String = "{}",
        catalog: Int = 100,
        latest: Boolean = true,
        type: String = "InGridGeoDataset",
    ) {
        entityManager.createNativeQuery(
            """INSERT INTO document (id, catalog_id, uuid, type, title, data, version, is_latest, state)
               VALUES (:id, :catalog, :uuid, :type, :title, CAST(:data AS jsonb), 0, :latest, 'DRAFT')""",
        ).setParameter("id", nextId++).setParameter("catalog", catalog).setParameter("uuid", uuid)
            .setParameter("type", type).setParameter("title", title).setParameter("data", data).setParameter("latest", latest).executeUpdate()
    }

    private fun user(vararg roles: String) = UsernamePasswordAuthenticationToken("test-user", "", roles.map(::SimpleGrantedAuthority))
}
