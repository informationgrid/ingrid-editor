/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.tasks

import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.VersionInfo
import de.ingrid.igeserver.utils.setAdminAuthentication
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component
import org.springframework.transaction.PlatformTransactionManager

@Component
class FixPathsTask(
    val entityManager: EntityManager,
    val transactionManager: PlatformTransactionManager,
) {
    val log = logger()

    private val sqlRootDocumentWrapper = """
        SELECT dw.id FROM DocumentWrapper dw WHERE dw.catalog.identifier=:catalogIdentifier AND dw.parent IS NULL
    """.trimIndent()

    private val updateWrapperPath = """
        UPDATE document_wrapper SET path=CAST(:path as int[]) WHERE id=:id
    """.trimIndent()

    @EventListener(ApplicationReadyEvent::class)
    fun onStartup() {
        val catalogs = getCatalogsForPostMigration()
        if (catalogs.isEmpty()) return

        setAdminAuthentication("FixPaths","Task")

        catalogs.forEach { catalog ->
            log.info("Execute FixPathsTask for catalog: $catalog")
            ClosableTransaction(transactionManager).use {
                migratePaths(catalog)
                removePostMigrationInfo(catalog)
                log.info("Finished FixPathsTask for catalog: $catalog")
            }
        }

    }


    fun migratePaths(catalogIdentifier: String) {
        val docWrappersRoot = entityManager.createQuery(sqlRootDocumentWrapper)
            .setParameter("catalogIdentifier", catalogIdentifier)
            .resultList

        docWrappersRoot.forEach { wrapperId ->
            addChildren(wrapperId as Int, mutableListOf())
        }
    }

    private fun addChildren(id: Int, previousUuids: MutableList<Int>) {

        previousUuids.add(id)
        val childrenIds = entityManager
            .createQuery("SELECT dw.id FROM DocumentWrapper dw where dw.parent is not null and dw.parent.id = $id")
            .resultList

        childrenIds.forEach { childId ->
            entityManager
                .createNativeQuery(updateWrapperPath)
                .setParameter("path", "{${previousUuids.joinToString()}}")
                .setParameter("id", childId)
                .executeUpdate()

            addChildren(childId as Int, previousUuids.toMutableList())
        }
    }


    private fun getCatalogsForPostMigration(): List<String> {
        return try {
            entityManager
                .createQuery(
                    "SELECT version FROM VersionInfo version WHERE version.key = 'doFixPaths'",
                    VersionInfo::class.java
                )
                .resultList
                .map { it.value!! }
        } catch (e: Exception) {
            log.warn("Could not query version_info table")
            emptyList()
        }
    }

    private fun removePostMigrationInfo(catalogIdentifier: String) {
        entityManager
            .createQuery(
                "DELETE FROM VersionInfo version WHERE version.key = 'doFixPaths' AND version.value = '${catalogIdentifier}'"
            )
            .executeUpdate()
    }

}
