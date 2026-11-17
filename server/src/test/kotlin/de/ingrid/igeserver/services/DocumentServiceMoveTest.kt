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
package de.ingrid.igeserver.services

import IntegrationTest
import de.ingrid.igeserver.utils.setAdminAuthentication
import io.kotest.matchers.shouldBe
import jakarta.persistence.EntityManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

@Transactional
class DocumentServiceMoveTest : IntegrationTest() {

    @Autowired
    private lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var documentService: DocumentService

    @Autowired
    private lateinit var aclService: IgeAclService

    private val catalogId = "test_catalog"

    @BeforeEach
    fun setup() {
        setAdminAuthentication()
    }

    @Test
    fun `moving a dataset updates the paths of all nested descendants`() {
        addWrapper(21000, "FOLDER", null)
        addWrapper(21010, "InGridGeoDataset", null)
        addWrapper(21011, "InGridGeoDataset", 21010)
        addWrapper(21012, "InGridGeoDataset", 21011)

        documentService.updateParent(catalogId, 21010, 21000)
        entityManager.flush()

        parentOf(21010) shouldBe 21000
        pathOf(21010) shouldBe listOf("21000")
        pathOf(21011) shouldBe listOf("21000", "21010")
        pathOf(21012) shouldBe listOf("21000", "21010", "21011")
        aclParentOf(21010) shouldBe 21000
    }

    @Test
    fun `moving an address folder updates the paths of persons below an institution`() {
        addWrapper(21100, "FOLDER", null, category = "address")
        addWrapper(21110, "FOLDER", null, category = "address")
        addWrapper(21111, "InGridOrganisationDoc", 21110, category = "address")
        addWrapper(21112, "InGridPersonDoc", 21111, category = "address")

        documentService.updateParent(catalogId, 21110, 21100)
        entityManager.flush()

        pathOf(21110) shouldBe listOf("21100")
        pathOf(21111) shouldBe listOf("21100", "21110")
        pathOf(21112) shouldBe listOf("21100", "21110", "21111")
    }

    private fun addWrapper(id: Int, type: String, parentId: Int?, category: String = "data") {
        val parentPath = parentId?.let { pathOf(it) + it.toString() } ?: emptyList()
        entityManager.createNativeQuery(
            """INSERT INTO document_wrapper (id, catalog_id, parent_id, uuid, type, category, deleted, path)
               VALUES (:id, 100, CAST(:parentId AS integer), :uuid, :type, :category, 0, CAST(:path AS text[]))""",
        ).setParameter("id", id).setParameter("parentId", parentId).setParameter("uuid", "uuid-$id")
            .setParameter("type", type).setParameter("category", category)
            .setParameter("path", "{${parentPath.joinToString(",")}}")
            .executeUpdate()
        entityManager.createNativeQuery(
            """INSERT INTO document (id, catalog_id, uuid, type, title, data, version, is_latest, state)
               VALUES (:id, 100, :uuid, :type, :title, CAST('{}' AS jsonb), 0, true, 'DRAFT')""",
        ).setParameter("id", id).setParameter("uuid", "uuid-$id").setParameter("type", type)
            .setParameter("title", "Document $id")
            .executeUpdate()
        aclService.createAclForDocument(id, parentId)
    }

    private fun parentOf(id: Int): Int? = entityManager.createNativeQuery("SELECT parent_id FROM document_wrapper WHERE id = :id")
        .setParameter("id", id).singleResult?.let { (it as Number).toInt() }

    private fun pathOf(id: Int): List<String> = entityManager.createNativeQuery("SELECT CAST(path AS text) FROM document_wrapper WHERE id = :id")
        .setParameter("id", id).singleResult
        .let { (it as String).trim('{', '}') }
        .let { if (it.isEmpty()) emptyList() else it.split(",") }

    private fun aclParentOf(id: Int): Int? = entityManager.createNativeQuery(
        """SELECT CAST(parent_aoi.object_id_identity AS integer)
           FROM acl_object_identity aoi JOIN acl_object_identity parent_aoi ON parent_aoi.id = aoi.parent_object
           WHERE aoi.object_id_identity = :id""",
    ).setParameter("id", id.toString()).resultList.firstOrNull()?.let { (it as Number).toInt() }
}
