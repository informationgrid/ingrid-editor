/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.repository.DocumentRepository
import de.ingrid.igeserver.services.CodelistHandler
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Service
class M042_MigrateSelectBoxValues : MigrationBase("0.42") {

    val log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    @Autowired
    private lateinit var docRepo: DocumentRepository

    @Autowired
    private lateinit var codelistHandler: CodelistHandler

    override fun exec() {}

    override fun postExec() {
        ClosableTransaction(transactionManager).use {
            val docs = entityManager.createQuery("SELECT doc FROM Document doc, Catalog cat").resultList
            setAuthentication()

            docs.forEach { doc ->
                doc as Document
                try {
                    if (doc.type == "mCloudDoc") {
                        migrateField(doc, "license", "6500")
                        migrateField(doc, "periodicity")
                        migrateNestedField(doc, "temporal", "rangeType")
                        migrateArray(doc, "events", "text")
                        migrateArray(doc, "distributions", "type")
                        migrateArray(doc, "distributions", "format", "20003")
                        migrateArray(doc, "addresses", "type")
                        log.info("Migrated mCloudDoc with dbID ${doc.id}")
                    } else if (doc.type == "McloudAddressDoc") {
                        migrateArray(doc, "contact", "type")
                        log.info("Migrated McloudAddressDoc with dbID ${doc.id}")
                    }
                    docRepo.save(doc)
                } catch (ex: Exception) {
                    log.error("Error migrating document with dbID ${doc.id}", ex)
                }
            }
        }
    }

    private fun migrateField(doc: Document, field: String, codelistId: String? = null) {
        var value = doc.data.get(field)?.textValue() ?: return

        if (codelistId != null) {
            value =
                (handleCodelistValue(codelistId, doc.data, doc.catalog?.identifier.toString(), field, value) ?: return)
        }

        val updatedValue = jacksonObjectMapper().createObjectNode().apply {
            put("key", value)
        }
        doc.data.set<JsonNode>(field, updatedValue)
    }

    private fun handleCodelistValue(
        codelistId: String,
        item: ObjectNode,
        catalogIdentifier: String,
        field: String,
        value: String
    ): String? {
        var codelist = this.codelistHandler.getCodelists(listOf(codelistId))
        if (codelist.isEmpty()) {
            codelist = this.codelistHandler.getCatalogCodelists(catalogIdentifier)
                .filter { it.id == codelistId }
        }

        val entry = codelist[0].entries.find { it.getField("de") == value }
        return if (entry == null) {
            val updatedValue = jacksonObjectMapper().createObjectNode().apply {
                put("key", null as String?)
                put("value", value)
            }
            item.set<JsonNode>(field, updatedValue)
            null
        } else {
            entry.id
        }

    }

    private fun migrateNestedField(doc: Document, field: String, nestedField: String) {
        val temporal = doc.data.get(field) ?: return
        if (temporal.isNull) return

        temporal as ObjectNode

        val value = temporal.get(nestedField) ?: return
        if (value.isNull) return

        val updatedValue = jacksonObjectMapper().createObjectNode().apply {
            put("key", value.textValue())
        }
        temporal.set<JsonNode>(nestedField, updatedValue)
    }

    private fun migrateArray(doc: Document, arrayField: String, field: String, codelistId: String? = null) {
        val array = doc.data.get(arrayField) ?: return
        if (array.isNull) return

        array as ArrayNode

        array.forEach { item ->
            val fieldElement = item.get(field) ?: return
            if (fieldElement.isNull) return

            item as ObjectNode

            var value = fieldElement.textValue()

            if (value != null) {
                if (codelistId != null) {
                    val codelistValue =
                        handleCodelistValue(codelistId, item, doc.catalog?.identifier.toString(), field, value)
                            ?: return
                    value = codelistValue
                }
                val updatedValue = jacksonObjectMapper().createObjectNode().apply {
                    put("key", value)
//                    put("key", null as String)
//                    put("value", value)
                }
                item.set<JsonNode>(field, updatedValue)
            }
        }
    }

    private fun setAuthentication() {
        val auth: Authentication =
            UsernamePasswordAuthenticationToken("Scheduler", "Task", listOf(SimpleGrantedAuthority("cat-admin")))
        SecurityContextHolder.getContext().authentication = auth
    }

}
