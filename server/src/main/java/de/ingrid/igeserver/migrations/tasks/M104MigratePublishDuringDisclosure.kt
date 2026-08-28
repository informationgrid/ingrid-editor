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

import de.ingrid.igeserver.imports.internal.migrations.Migrate170
import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.utils.setAdminAuthentication
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager
import tools.jackson.databind.JsonNode

@Profile("uvp")
@Service
class M104MigratePublishDuringDisclosure : MigrationBase("0.104") {

    private var log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    @Autowired
    private lateinit var catalogService: CatalogService

    override fun exec() {
        setAdminAuthentication()

        val catalogs = catalogService.getCatalogs()
        val uvpCatalogs = catalogs.filter { it.type == "uvp" }

        uvpCatalogs.forEach { catalog ->
            val catalogId = catalog.identifier
            log.info("Migrating publishDuringDisclosure for catalog: $catalogId")

            migrateDocuments(catalogId)
        }
    }

    private fun migrateDocuments(catalogId: String) {
        val pageSize = 100
        var page = 1

        ClosableTransaction(transactionManager).use {
            setAdminAuthentication("Migration", "Task")
            do {
                val documents =
                    entityManager.createQuery("""SELECT doc FROM Document doc JOIN doc.catalog cat WHERE doc.state != "ARCHIVED" AND cat.identifier = :catalogId ORDER BY doc.id""")
                        .setParameter("catalogId", catalogId)
                        .setFirstResult((page - 1) * pageSize)
                        .setMaxResults(pageSize)
                        .resultList

                documents.forEach {
                    it as Document

                    try {
                        val data = it.data
                        Migrate170.getProcessingStepsOfDocument(data)?.let { processingSteps ->
                            data.set("processingSteps", processingSteps)
                            entityManager.merge(it)
                        }
                    } catch (e: Exception) {
                        log.error("Error migrating doc with dbID ${it.id}, probably because it has no data: ${e.message}")
                    }
                }
                page++
            } while (documents.size == pageSize)
        }
    }
}
