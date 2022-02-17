package de.ingrid.igeserver.migrations.tasks

import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.repository.DocumentRepository
import de.ingrid.igeserver.services.CodelistHandler
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager
import javax.persistence.EntityManager

@Service
class M041_MigrateSelectBoxValues : MigrationBase("0.41") {

    val log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    @Autowired
    private lateinit var docRepo: DocumentRepository

    @Autowired
    private lateinit var codelistHandler: CodelistHandler

    override fun exec() {
        ClosableTransaction(transactionManager).use {
            val docs = entityManager.createQuery("SELECT doc FROM Document doc").resultList
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
                        migrateArray(doc, "distributions", "format")
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
            var codelist = this.codelistHandler.getCodelists(listOf(codelistId))
            if (codelist.isEmpty()) {
                codelist = this.codelistHandler.getCatalogCodelists(doc.catalogIdentifier.toString())
                    .filter { it.id == codelistId }
            }

            val entry = codelist[0].entries.find { it.getField("de") == value }
            if (entry == null) {
                val updatedValue = jacksonObjectMapper().createObjectNode().apply {
                    put("key", null as String)
                    put("value", value)
                }
                doc.data.put(field, updatedValue)
                return
            } else {
                value = entry.id
            }
        }

        val updatedValue = jacksonObjectMapper().createObjectNode().apply {
            put("key", value)
        }
        doc.data.put(field, updatedValue)
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
        temporal.put(nestedField, updatedValue)
    }

    private fun migrateArray(doc: Document, arrayField: String, field: String) {
        val array = doc.data.get(arrayField) ?: return
        if (array.isNull) return

        array as ArrayNode

        array.forEach { item ->
            val fieldElement = item.get(field) ?: return
            if (fieldElement.isNull) return

            item as ObjectNode

            val value = fieldElement.textValue()

            if (value != null) {
                val updatedValue = jacksonObjectMapper().createObjectNode().apply {
                    put("key", value)
                }
                item.put(field, updatedValue)
            }
        }
    }

    private fun setAuthentication() {
        val auth: Authentication =
            UsernamePasswordAuthenticationToken("Scheduler", "Task", listOf(SimpleGrantedAuthority("cat-admin")))
        SecurityContextHolder.getContext().authentication = auth
    }

}
