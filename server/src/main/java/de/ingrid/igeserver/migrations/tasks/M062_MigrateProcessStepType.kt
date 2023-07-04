package de.ingrid.igeserver.migrations.tasks

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
class M062_MigrateProcessStepType : MigrationBase("0.62") {

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
                    if (doc.type == "InGridGeoDataset" ) {
                        if (migrateProcessStep(doc)) {
                            log.info("Migrated doc with dbID ${doc.id}")
                            docRepo.save(doc)
                        }
                    }
                } catch (ex: Exception) {
                    log.error("Error migrating document with dbID ${doc.id}", ex)
                }
            }
        }
    }

    private fun migrateProcessStep(doc: Document): Boolean {
        val processStep: ObjectNode = doc.data.get("dataQualityInfo")?.get("lineage")?.get("source")?.get("processStep") as ObjectNode? ?: return false
        val description = processStep.get("description")?.textValue() ?: return false




        val newStructure = jacksonObjectMapper().createArrayNode().apply {
            add(jacksonObjectMapper().createObjectNode().apply {
                putNull("key")
                put("value", description)
            })
        }

        processStep.set<ObjectNode>("description", newStructure)
        return true
    }


    private fun setAuthentication() {
        val auth: Authentication =
            UsernamePasswordAuthenticationToken("Scheduler", "Task", listOf(SimpleGrantedAuthority("cat-admin")))
        SecurityContextHolder.getContext().authentication = auth
    }

}
