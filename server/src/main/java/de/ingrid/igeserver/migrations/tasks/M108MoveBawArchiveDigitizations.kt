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

import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.utils.setAdminAuthentication
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

/**
 * Moves all datasets of BAW catalogs, which have the free keyword "Digitalisate aus Archiv",
 * into the folder "Z0_Digitalisierte_Akten". Catalogs without this folder are skipped.
 */
@Profile("ingrid-baw")
@Service
class M108MoveBawArchiveDigitizations : MigrationBase("0.108") {

    private var log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    @Autowired
    private lateinit var catalogService: CatalogService

    @Autowired
    private lateinit var documentService: DocumentService

    companion object {
        const val TARGET_FOLDER_TITLE = "Z0_Digitalisierte_Akten"
        const val KEYWORD = "Digitalisate aus Archiv"
    }

    override fun exec() {}

    override fun postExec() {
        setAdminAuthentication()

        catalogService.getCatalogs()
            .filter { it.type == "ingrid-baw" }
            .forEach { catalog ->
                ClosableTransaction(transactionManager).use {
                    setAdminAuthentication("Migration", "Task")
                    migrateCatalog(catalog.identifier)
                }
            }
    }

    private fun migrateCatalog(catalogId: String) {
        val folderIds = findTargetFolders(catalogId)
        if (folderIds.size != 1) {
            if (folderIds.isEmpty()) {
                log.info("Catalog '$catalogId': folder '$TARGET_FOLDER_TITLE' not found, skipping")
            } else {
                log.warn("Catalog '$catalogId': found ${folderIds.size} folders named '$TARGET_FOLDER_TITLE' ($folderIds), skipping")
            }
            return
        }
        val folderId = folderIds.first()

        val datasetIds = findDatasetsToMove(catalogId, folderId)
        log.info("Catalog '$catalogId': moving ${datasetIds.size} datasets with keyword '$KEYWORD' into folder $folderId")

        datasetIds.forEach { id ->
            documentService.updateParent(catalogId, id, folderId)
            log.debug("Moved dataset $id into folder $folderId")
        }
    }

    private fun findTargetFolders(catalogId: String): List<Int> = entityManager.createNativeQuery(
        """
            SELECT dw.id
            FROM document_wrapper dw
              JOIN catalog c ON c.id = dw.catalog_id
              JOIN document d ON d.catalog_id = dw.catalog_id AND d.uuid = dw.uuid AND d.is_latest
            WHERE c.identifier = :catalogId
              AND dw.category = 'data' AND dw.type = 'FOLDER' AND dw.deleted = 0
              AND d.title = :title
        """.trimIndent(),
    )
        .setParameter("catalogId", catalogId)
        .setParameter("title", TARGET_FOLDER_TITLE)
        .resultList
        .map { (it as Number).toInt() }

    /**
     * Find the top-most datasets with the keyword, which are not yet inside the folder.
     * Nested datasets with the keyword are not returned, since they are moved together with their
     * parent and keep their position in the hierarchy.
     * Datasets containing the target folder are excluded, since moving them would create a cycle.
     */
    private fun findDatasetsToMove(catalogId: String, folderId: Int): List<Int> = entityManager.createNativeQuery(
        """
            WITH matches AS (
              SELECT dw.id, coalesce(dw.path, '{}') AS path
              FROM document_wrapper dw
                JOIN catalog c ON c.id = dw.catalog_id
                JOIN document d ON d.catalog_id = dw.catalog_id AND d.uuid = dw.uuid AND d.is_latest
              WHERE c.identifier = :catalogId
                AND dw.category = 'data' AND dw.type <> 'FOLDER' AND dw.deleted = 0
                AND d.data -> 'keywords' -> 'free' @> CAST(:keywordFilter AS jsonb)
                AND NOT EXISTS (
                  SELECT 1 FROM document_wrapper target
                  WHERE target.id = :folderId AND target.path @> ARRAY[CAST(dw.id AS text)]
                )
            )
            SELECT m.id
            FROM matches m
            WHERE NOT (m.path @> ARRAY[CAST(:folderId AS text)])
              AND NOT EXISTS (SELECT 1 FROM matches ancestor WHERE m.path @> ARRAY[CAST(ancestor.id AS text)])
            ORDER BY m.id
        """.trimIndent(),
    )
        .setParameter("catalogId", catalogId)
        .setParameter("folderId", folderId)
        .setParameter("keywordFilter", """[{"label": "$KEYWORD"}]""")
        .resultList
        .map { (it as Number).toInt() }
}
