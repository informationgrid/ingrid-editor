package de.ingrid.igeserver.migrations.tasks

import com.fasterxml.jackson.databind.node.ArrayNode
import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.repository.DocumentRepository
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager
import javax.persistence.EntityManager

/**
 * Add mcloud uuid keyword to all mcloud objects
 */
@Service
class M050_AddMcloudKeyword : MigrationBase("0.50") {


    private var log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    @Autowired
    private lateinit var docRepo: DocumentRepository
    override fun exec() {
        ClosableTransaction(transactionManager).use {
            val docs = entityManager.createQuery("SELECT doc FROM Document doc WHERE doc.catalog.type='mcloud'").resultList
            setAuthentication()

            docs.forEach { doc ->
                doc as Document
                try {
                    addMcloudKeyword(doc)
                    docRepo.save(doc)
                } catch (ex: Exception) {
                    log.error("Error migrating document with dbID ${doc.id}", ex)
                }
            }
        }
    }

    private fun addMcloudKeyword(doc: Document) {
        val keywords = doc.data.withArray("keywords")
        keywords.add("mcloud_id:${doc.uuid}")
        doc.data.set<ArrayNode>("keywords", keywords);
    }

    private fun setAuthentication() {
        val auth: Authentication =
            UsernamePasswordAuthenticationToken("Scheduler", "Task", listOf(SimpleGrantedAuthority("cat-admin")))
        SecurityContextHolder.getContext().authentication = auth
    }

}
