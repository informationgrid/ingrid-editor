package de.ingrid.igeserver.migrations.tasks

import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.repository.DocumentRepository
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
class M065_MigrateKeywords : MigrationBase("0.65") {

    val log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    @Autowired
    private lateinit var docRepo: DocumentRepository

    override fun exec() {}

    override fun postExec() {
        ClosableTransaction(transactionManager).use {
            val docs = entityManager.createQuery("SELECT doc FROM Document doc").resultList
            val docTypesToMigrate = listOf(
                "InGridGeoDataset",
                "InGridDataCollection",
                "InGridGeoService",
                "InGridInformationSystem",
                "InGridLiterature",
                "InGridProject",
                "InGridSpecialisedTask"
            )
            setAuthentication()

            docs
                .map { it as Document }
                .filter { docTypesToMigrate.contains(it.type) }
                .forEach {
                    try {
                        if (migrateKeywords(it)) {
                            log.info("Migrated doc with dbID ${it.id}")
                            docRepo.save(it)
                        }
                    } catch (ex: Exception) {
                        log.error("Error migrating document with dbID ${it.id}", ex)
                    }
                }
        }
    }

    private fun migrateKeywords(doc: Document): Boolean {
        val simpleKeywords: ArrayNode =
            doc.data.get("keywords") as ArrayNode? ?: jacksonObjectMapper().createArrayNode()
        val umthesKeywords: ArrayNode =
            doc.data.get("keywordsUmthes") as ArrayNode? ?: jacksonObjectMapper().createArrayNode()

        
        val newStructure = jacksonObjectMapper().createObjectNode().apply {
            val simpleConverted = jacksonObjectMapper().createArrayNode().apply {
                simpleKeywords.forEach {
                    add(jacksonObjectMapper().createObjectNode().apply {
                        put("label", it.asText())
                    })
                }
            }
            set<ArrayNode>("free", simpleConverted)
            set<ArrayNode>("umthes", umthesKeywords)
        }
        
        doc.data.set<ArrayNode>("keywords", newStructure)
        doc.data.remove("keywordsUmthes")
        return true
    }


    private fun setAuthentication() {
        val auth: Authentication =
            UsernamePasswordAuthenticationToken("Scheduler", "Task", listOf(SimpleGrantedAuthority("cat-admin")))
        SecurityContextHolder.getContext().authentication = auth
    }

}
