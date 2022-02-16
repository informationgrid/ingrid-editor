package de.ingrid.igeserver.migrations.tasks

import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.repository.DocumentRepository
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

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager
    
    @Autowired
    private lateinit var docRepo: DocumentRepository

    private val sql = """
        
    """.trimIndent()

    override fun exec() {
        ClosableTransaction(transactionManager).use {
            val docs = entityManager.createQuery("SELECT doc FROM Document doc").resultList
            setAuthentication()

            docs.forEach { doc ->
                doc as Document
                if (doc.type == "mCloudDoc") {
                    migrateField(doc, "license")
                    migrateField(doc, "periodicity")
                    migrateNestedField(doc, "temporal", "rangeType")
                    migrateArray(doc, "events", "text")
                    migrateArray(doc, "distributions", "type")
                    migrateArray(doc, "distributions", "format")
                } else if (doc.type == "McloudAddressDoc") {
                    
                }
                docRepo.save(doc)
            }
        }
    }

    private fun migrateField(doc: Document, field: String) {
        val value = doc.data.get(field)?.textValue() ?: return

        val updatedValue = jacksonObjectMapper().createObjectNode().apply {
            put("key", value)
        }
        doc.data.put(field, updatedValue)
    }

    private fun migrateNestedField(doc: Document, field: String, nestedField: String) {
        val value = doc.data.get(field)?.get(nestedField) ?: return

        val updatedValue = jacksonObjectMapper().createObjectNode().apply {
            put("key", value)
        }
        doc.data.put(field, updatedValue)
    }

    private fun migrateArray(doc: Document, arrayField: String, field: String) {
        val array = doc.data.get(arrayField) ?: return
        if (array.isNull) return
        
        array as ArrayNode
        
        array.forEach { item ->
            val value = item.get(field)?.textValue()
            if (value != null) {
                val updatedValue = jacksonObjectMapper().createObjectNode().apply {
                    put("key", value)
                }
                doc.data.put(field, updatedValue)
            }
        }
    }
    
    private fun setAuthentication() {
        val auth: Authentication =
            UsernamePasswordAuthenticationToken("Scheduler", "Task", listOf(SimpleGrantedAuthority("cat-admin")))
        SecurityContextHolder.getContext().authentication = auth
    }

}
