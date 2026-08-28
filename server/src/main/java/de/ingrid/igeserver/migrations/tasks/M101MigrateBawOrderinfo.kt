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

import de.ingrid.codelists.CodeListService
import de.ingrid.codelists.model.CodeList
import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.utils.getString
import de.ingrid.igeserver.utils.setAdminAuthentication
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager
import tools.jackson.databind.JsonNode
import tools.jackson.databind.ObjectMapper
import tools.jackson.databind.node.JsonNodeType

@Profile("ingrid-baw")
@Service
class M101MigrateBawOrderinfo : MigrationBase("0.101") {

    private var log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    @Autowired
    private lateinit var codeListService: CodeListService

    @Autowired
    private lateinit var catalogService: CatalogService

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    override fun exec() {
        setAdminAuthentication()

        log.info("Synchronizing codelists from server...")
        try {
            codeListService.updateFromServer()
        } catch (e: Exception) {
            log.warn("Could not update codelists from server: ${e.message}")
        }

        val catalogs = catalogService.getCatalogs()
        val bawCatalogs = catalogs.filter { it.type == "ingrid-baw" }

        bawCatalogs.forEach { catalog ->
            val catalogId = catalog.identifier
            log.info("Migrating bawOrderInfo for catalog: $catalogId")

            migrateDocuments(catalogId)
        }
    }

    private fun migrateDocuments(catalogId: String) {
        val codelist = codeListService.getCodeList("bawOrderInfo")

        val pageSize = 100
        var page = 1

        do {
            var documentsSize = 0
            ClosableTransaction(transactionManager).use {
                setAdminAuthentication("Migration", "Task")
                val documents =
                    entityManager.createQuery("""SELECT doc FROM Document doc JOIN doc.catalog cat WHERE doc.state != 'ARCHIVED' AND cat.identifier = :catalogId ORDER BY doc.id""")
                        .setParameter("catalogId", catalogId)
                        .setFirstResult((page - 1) * pageSize)
                        .setMaxResults(pageSize)
                        .resultList

                documentsSize = documents.size
                documents.forEach {
                    it as Document
                    migrateDocument(it, catalogId, codelist)
                }
            }
            page++
        } while (documentsSize == pageSize)
    }

    private fun getOrderNumber(doc: Document): String? {
        val data = doc.data
        return when (data.get("orderNumber")?.nodeType) {
            JsonNodeType.STRING -> data.getString("orderNumber")
            JsonNodeType.ARRAY -> data.get("orderNumber").get(0)?.asString()
            else -> null
        }?.trim()
    }

    private fun migrateDocument(doc: Document, catalogId: String, codelist: CodeList) {
        val data = doc.data

        val orderNumber = getOrderNumber(doc) ?: return

        if (orderNumber.isEmpty()) {
            data.remove("orderNumber")
            data.remove("orderTitle")
            data.remove("orderTitles")
            return
        }

        // identify codelist entry by order number. orderTitle is ignored unless orderNumber is not found in codelist
        val foundEntry = codelist.entries.find { it.fields["de"]!!.startsWith(orderNumber) }

        val keyValue = if (foundEntry == null) {
            log.warn("Codelist entry for '$orderNumber' not found in bawOrderInfo for catalog $catalogId. Adding as free entry. (Doc: ${doc.uuid})")

            val orderTitle = data.getString("orderTitle")?.trim()
                ?: data.get("orderTitles")
                    ?.let { titles ->
                        if (titles.isArray) {
                            titles.joinToString { it.asString().trim() }
                        } else {
                            null
                        }
                    }

            val combinedValue = if (orderTitle.isNullOrEmpty()) orderNumber else "$orderNumber - $orderTitle"

            objectMapper.createObjectNode().apply {
                putNull("key")
                put("value", combinedValue)
                put("_codelistId", "bawOrderInfo")
            }
        } else {
            objectMapper.createObjectNode().apply {
                put("key", foundEntry.id)
                put("value", foundEntry.getField("de"))
                put("_codelistId", "bawOrderInfo")
            }
        }

        data.set("bawOrderInfo", keyValue)
        data.remove("orderNumber")
        data.remove("orderTitle")
        data.remove("orderTitles")
    }
}
