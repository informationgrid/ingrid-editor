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
package de.ingrid.igeserver.migrations.tasks

import IntegrationTest
import de.ingrid.igeserver.services.IgeAclService
import de.ingrid.igeserver.utils.setAdminAuthentication
import io.kotest.matchers.shouldBe
import jakarta.persistence.EntityManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.ApplicationContext
import org.springframework.transaction.annotation.Transactional

@Transactional
class M108MoveBawArchiveDigitizationsTest : IntegrationTest() {

    @Autowired
    private lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var aclService: IgeAclService

    @Autowired
    private lateinit var applicationContext: ApplicationContext

    private val catalogId = "test_catalog"

    private val keywordData = """{"keywords": {"free": [{"label": "Other"}, {"label": "Digitalisate aus Archiv"}]}}"""

    @BeforeEach
    fun setup() {
        setAdminAuthentication()
    }

    @Test
    fun `migration moves datasets with the keyword into the archive folder`() {
        useBawCatalog()
        addWrapper(20100, "FOLDER", null, title = "Other folder")
        addWrapper(20200, "FOLDER", 20100, title = M108MoveBawArchiveDigitizations.TARGET_FOLDER_TITLE)
        addWrapper(20201, "FOLDER", 20200, title = "Subfolder")
        addWrapper(20202, "InGridGeoDataset", 20201, data = keywordData)
        addWrapper(20300, "InGridGeoDataset", null, data = keywordData)
        addWrapper(20301, "InGridGeoDataset", 20300)
        addWrapper(20302, "InGridGeoDataset", 20301, data = keywordData)
        addWrapper(20303, "InGridGeoDataset", 20302)
        addWrapper(20400, "InGridGeoDataset", 20100)
        addWrapper(20401, "FOLDER", 20100, title = "Folder with keyword", data = keywordData)

        runMigration()

        // top-level match moves with its whole subtree
        parentOf(20300) shouldBe 20200
        pathOf(20300) shouldBe listOf("20100", "20200")
        aclParentOf(20300) shouldBe 20200
        pathOf(20301) shouldBe listOf("20100", "20200", "20300")
        // nested match keeps its position in the hierarchy
        parentOf(20302) shouldBe 20301
        pathOf(20302) shouldBe listOf("20100", "20200", "20300", "20301")
        aclParentOf(20302) shouldBe 20301
        pathOf(20303) shouldBe listOf("20100", "20200", "20300", "20301", "20302")
        // match already somewhere inside the archive folder stays there
        parentOf(20202) shouldBe 20201
        // datasets without the keyword and folders stay where they are
        parentOf(20400) shouldBe 20100
        parentOf(20401) shouldBe 20100
    }

    @Test
    fun `migration skips catalogs without the archive folder`() {
        useBawCatalog()
        addWrapper(20500, "FOLDER", null, title = "Other folder")
        addWrapper(20510, "InGridGeoDataset", 20500, data = keywordData)

        runMigration()

        parentOf(20510) shouldBe 20500
        pathOf(20510) shouldBe listOf("20500")
    }

    @Test
    fun `migration ignores catalogs of other types`() {
        addWrapper(20600, "FOLDER", null, title = M108MoveBawArchiveDigitizations.TARGET_FOLDER_TITLE)
        addWrapper(20610, "InGridGeoDataset", null, data = keywordData)

        runMigration()

        parentOf(20610) shouldBe null
    }

    private fun runMigration() {
        val migration = M108MoveBawArchiveDigitizations()
        applicationContext.autowireCapableBeanFactory.autowireBean(migration)
        migration.postExec()
        entityManager.flush()
        entityManager.clear()
    }

    private fun useBawCatalog() {
        entityManager.createNativeQuery("UPDATE catalog SET type = 'ingrid-baw' WHERE identifier = :id")
            .setParameter("id", catalogId)
            .executeUpdate()
        entityManager.clear()
    }

    private fun addWrapper(id: Int, type: String, parentId: Int?, title: String = "Dataset $id", data: String = "{}") {
        val parentPath = parentId?.let { pathOf(it) + it.toString() } ?: emptyList()
        entityManager.createNativeQuery(
            """INSERT INTO document_wrapper (id, catalog_id, parent_id, uuid, type, category, deleted, path)
               VALUES (:id, 100, CAST(:parentId AS integer), :uuid, :type, 'data', 0, CAST(:path AS text[]))""",
        ).setParameter("id", id).setParameter("parentId", parentId).setParameter("uuid", "uuid-$id")
            .setParameter("type", type).setParameter("path", "{${parentPath.joinToString(",")}}")
            .executeUpdate()
        entityManager.createNativeQuery(
            """INSERT INTO document (id, catalog_id, uuid, type, title, data, version, is_latest, state)
               VALUES (:id, 100, :uuid, :type, :title, CAST(:data AS jsonb), 0, true, 'DRAFT')""",
        ).setParameter("id", id).setParameter("uuid", "uuid-$id").setParameter("type", type)
            .setParameter("title", title).setParameter("data", data)
            .executeUpdate()
        aclService.createAclForDocument(id, parentId)
    }

    private fun parentOf(id: Int): Int? = entityManager.createNativeQuery("SELECT parent_id FROM document_wrapper WHERE id = :id")
        .setParameter("id", id).singleResult?.let { (it as Number).toInt() }

    @Suppress("UNCHECKED_CAST")
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
