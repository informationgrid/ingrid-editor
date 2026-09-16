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
package de.ingrid.igeserver.profiles.ingrid

import IntegrationTest
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.profiles.ingrid.services.IngridDocumentSearchService
import de.ingrid.igeserver.profiles.ingrid_hmdk.services.HmbtgDocumentSearchService
import io.kotest.matchers.shouldBe
import jakarta.persistence.EntityManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.transaction.annotation.Transactional

@Transactional
class ProfileDocumentSearchServiceTest : IntegrationTest() {
    @Autowired private lateinit var entityManager: EntityManager

    @Autowired private lateinit var hmdkSearch: HmbtgDocumentSearchService

    @Autowired private lateinit var ingridSearch: IngridDocumentSearchService

    private val admin = user("ROLE_cat-admin")
    private val reader = user("GROUP_READTREE")
    private val denied = user("GROUP_NO_ACCESS")
    private var nextId = 10000
    private val mapper = jacksonObjectMapper()

    @Test
    fun `HMDK search keeps published archived readable latest documents in the current catalog`() {
        val published = """{"properties":{"publicationHmbTG":true}}"""
        addDocument("one", "Same title", published)
        addDocument("two", "Same title", published, archived = true)
        addDocument("false", "False", """{"properties":{"publicationHmbTG":false}}""")
        addDocument("old", "New", "{}")
        addVersion("old", "Old", published, latest = false)
        addDocument("deleted", "Deleted", published, deleted = true)
        addDocument("foreign", "Foreign", published, catalog = 101)

        hmdkSearch.getDocumentTitles("test_catalog", admin, listOf("one", "one", "two", "false", "old", "deleted", "foreign", "' OR 1=1 --")) shouldBe listOf("Same title", "Same title")
        hmdkSearch.getDocumentTitles("test_catalog", admin, emptyList()) shouldBe emptyList()
        hmdkSearch.getDocumentTitles("test_catalog", denied, listOf("one")) shouldBe emptyList()
    }

    @Test
    fun `HMDK search applies ACL and safely binds unbounded UUID lists`() {
        val published = """{"properties":{"publicationHmbTG":true}}"""
        addVersion("c689240d-e7a9-45cc-b761-44eda0cda1f1", "Search A denied", published)
        addVersion("8f891e4e-161e-4d2c-6869-03f02ab352dc", "Search B allowed", published)
        hmdkSearch.getDocumentTitles("test_catalog", reader, listOf("c689240d-e7a9-45cc-b761-44eda0cda1f1", "8f891e4e-161e-4d2c-6869-03f02ab352dc")) shouldBe listOf("Search B allowed")

        val uuids = (1..12).map { "uuid,'{}\\$it" }
        uuids.forEach { addDocument(it, "Title", published) }
        hmdkSearch.getDocumentTitles("test_catalog", admin, uuids).size shouldBe 12
    }

    @Test
    fun `Ingrid capability search requires matching resource and operation with readable current documents`() {
        val uuid = "resource' OR 1=1 --"
        addDocument("resource", "Resource", serviceData(uuid, "2"))
        addDocument("operation", "Operation", serviceData("other"))
        addDocument("malformed", "Malformed", """{"service":{"coupledResources":{},"operations":false}}""")
        addDocument("old", "New", "{}")
        addVersion("old", "Old", serviceData(uuid), latest = false)
        addDocument("deleted", "Deleted", serviceData(uuid), deleted = true)
        addDocument("foreign", "Foreign", serviceData(uuid), catalog = 101)
        ingridSearch.hasCoupledServiceWithGetCapabilities("test_catalog", admin, uuid) shouldBe false

        addDocument("match", "Match", serviceData(uuid), archived = true)
        ingridSearch.hasCoupledServiceWithGetCapabilities("test_catalog", admin, uuid) shouldBe true
        ingridSearch.hasCoupledServiceWithGetCapabilities("test_catalog", admin, "' OR 1=1 --") shouldBe false
        ingridSearch.hasCoupledServiceWithGetCapabilities("test_catalog", denied, uuid) shouldBe false
    }

    @Test
    fun `Ingrid capability search continues after unreadable matching services`() {
        addVersion("c689240d-e7a9-45cc-b761-44eda0cda1f1", "Denied", serviceData("target"))
        ingridSearch.hasCoupledServiceWithGetCapabilities("test_catalog", reader, "target") shouldBe false
        addVersion("8f891e4e-161e-4d2c-6869-03f02ab352dc", "Allowed", serviceData("target"))
        ingridSearch.hasCoupledServiceWithGetCapabilities("test_catalog", reader, "target") shouldBe true
    }

    private fun serviceData(uuid: String, operation: String = "1") = mapper.writeValueAsString(mapOf("service" to mapOf("coupledResources" to listOf(mapOf("uuid" to uuid)), "operations" to listOf(mapOf("name" to mapOf("key" to operation))))))

    private fun addDocument(uuid: String, title: String, data: String, catalog: Int = 100, archived: Boolean = false, deleted: Boolean = false) {
        entityManager.createNativeQuery("""INSERT INTO document_wrapper (id, catalog_id, uuid, type, category, deleted, tags) VALUES (:id, :catalog, :uuid, 'InGridGeoDataset', 'data', :deleted, CAST(:tags AS text[]))""")
            .setParameter("id", nextId++).setParameter("catalog", catalog).setParameter("uuid", uuid).setParameter("deleted", if (deleted) 1 else 0).setParameter("tags", if (archived) "{archived}" else "{}").executeUpdate()
        addVersion(uuid, title, data, catalog)
    }

    private fun addVersion(uuid: String, title: String, data: String, catalog: Int = 100, latest: Boolean = true) {
        entityManager.createNativeQuery("""INSERT INTO document (id, catalog_id, uuid, type, title, data, version, is_latest, state) VALUES (:id, :catalog, :uuid, 'InGridGeoDataset', :title, CAST(:data AS jsonb), 0, :latest, 'DRAFT')""")
            .setParameter("id", nextId++).setParameter("catalog", catalog).setParameter("uuid", uuid).setParameter("title", title).setParameter("data", data).setParameter("latest", latest).executeUpdate()
    }

    private fun user(vararg roles: String) = UsernamePasswordAuthenticationToken("test-user", "", roles.map(::SimpleGrantedAuthority))
}
