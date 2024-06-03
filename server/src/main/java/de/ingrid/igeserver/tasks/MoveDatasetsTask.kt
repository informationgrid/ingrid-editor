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

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.VersionInfo
import de.ingrid.igeserver.services.DocumentService
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component
import java.io.InputStream

@Component
class MoveDatasetsTask(
    val documentService: DocumentService,
    val entityManager: EntityManager,
) {
    val log = logger()

    @EventListener(ApplicationReadyEvent::class)
    fun onStartup() {
        val catalogs = getCatalogsForPostMigration()
        if (catalogs.isEmpty()) return

        catalogs.forEach { catalogId ->
            log.info("Moving datasets for '$catalogId'")
            val resource = MigrateUrlDataTypeTask::class.java.getResource("/move-datasets-${catalogId}.csv")
                ?: throw Exception("CSV file not found for migration: url-data-types-${catalogId}.csv")
            readCsv(resource.openStream()).forEach { (wrapperUuid, newParentUuid) ->
                log.info("Moving dataset '$wrapperUuid' to '$newParentUuid'")
                val wrapperId = documentService.getWrapperByCatalogAndDocumentUuid(catalogId, wrapperUuid).id!!
                val newParentId = documentService.getWrapperByCatalogAndDocumentUuid(catalogId, newParentUuid).id!!
                documentService.updateParent(catalogId, wrapperId, newParentId)
            }
            log.info("Finished moving datasets for '$catalogId'")
        }
    }

    private fun readCsv(inputStream: InputStream): List<Pair<String, String>> {
        val reader = inputStream.bufferedReader()
        val header = reader.readLine() // needed to skip header of CVS file
        return reader.lineSequence()
            .filter { it.isNotBlank() }
            .map {
                val (wrapperUuid, parentUuid) = it.split(',', ignoreCase = false, limit = 3)
                Pair(
                    wrapperUuid.trim().removeSurrounding("\""),
                    parentUuid.trim().removeSurrounding("\""),
                )
            }.toList()
    }


    private fun getCatalogsForPostMigration(): List<String> {
        return try {
            entityManager
                .createQuery(
                    "SELECT version FROM VersionInfo version WHERE version.key = 'doMoveDatasets'",
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
                "DELETE FROM VersionInfo version WHERE version.key = 'doMoveDatasets' AND version.value = '${catalogIdentifier}'"
            )
            .executeUpdate()
    }

}
