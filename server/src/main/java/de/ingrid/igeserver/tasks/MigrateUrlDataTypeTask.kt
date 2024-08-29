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

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.VersionInfo
import de.ingrid.igeserver.repository.DocumentRepository
import de.ingrid.igeserver.utils.getString
import de.ingrid.igeserver.utils.setAdminAuthentication
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component
import org.springframework.transaction.PlatformTransactionManager
import java.io.InputStream

@Component
class MigrateUrlDataTypeTask(
    val entityManager: EntityManager,
    val transactionManager: PlatformTransactionManager,
    val docRepo: DocumentRepository,
) {

    private data class DataTypeInfo(val url: String, val key: String, val value: String)

    val log = logger()

    @EventListener(ApplicationReadyEvent::class)
    fun onStartup() {
        val catalogs = getCatalogsForPostMigration()
        if (catalogs.isEmpty()) return

        setAdminAuthentication("MigrateUrlDataType", "Task")

        catalogs.forEach { catalog ->
            log.info("Execute MigrateUrlDataTypeTask for catalog: $catalog")
            val resource = MigrateUrlDataTypeTask::class.java.getResource("/url-data-types-$catalog.csv")
                ?: throw Exception("CSV file not found for migration: url-data-types-$catalog.csv")
            val migrateData = readCsv(resource.openStream())

            ClosableTransaction(transactionManager).use {
                migrateData.forEach {
                    updateDatasetsWithUrls(it)
                }
                removePostMigrationInfo(catalog)
                log.info("Finished MigrateUrlDataTypeTask for catalog: $catalog")
            }
        }
    }

    private fun updateDatasetsWithUrls(info: DataTypeInfo) {
        val docIds = entityManager
            .createNativeQuery("""SELECT id FROM document doc WHERE doc.data -> 'references' @> '[{"url": "${info.url}"}]'""")
            .resultList as List<Int>

        log.info("Migrate URL datatypes for docIds: $docIds")

        docIds.forEach {
            val doc = docRepo.findById(it).get()
            val references = doc.data.get("references")
            references
                .filter { ref -> ref.getString("url") == info.url }
                .forEach { ref ->
                    ref as ObjectNode
                    ref.set<JsonNode>(
                        "urlDataType",
                        jacksonObjectMapper().createObjectNode().apply { put("key", info.key) },
                    )
                }
            docRepo.save(doc)
        }
    }

    private fun readCsv(inputStream: InputStream): List<DataTypeInfo> {
        val reader = inputStream.bufferedReader()
        val header = reader.readLine() // needed to skip header of CVS file
        return reader.lineSequence()
            .filter { it.isNotBlank() }
            .map {
                val (url, key, value) = it.split(',', ignoreCase = false, limit = 3)
                DataTypeInfo(
                    url.trim().removeSurrounding("\""),
                    key.trim().removeSurrounding("\""),
                    value.trim().removeSurrounding("\""),
                )
            }.toList()
    }

    private fun getCatalogsForPostMigration(): List<String> {
        return try {
            entityManager
                .createQuery(
                    "SELECT version FROM VersionInfo version WHERE version.key = 'doFixMigrateUrlDataType'",
                    VersionInfo::class.java,
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
                "DELETE FROM VersionInfo version WHERE version.key = 'doFixMigrateUrlDataType' AND version.value = '$catalogIdentifier'",
            )
            .executeUpdate()
    }
}
