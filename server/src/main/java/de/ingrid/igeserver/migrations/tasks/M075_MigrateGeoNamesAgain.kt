package de.ingrid.igeserver.migrations.tasks

import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.repository.DocumentRepository
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Profile("ingrid")
@Service
class M075_MigrateGeoNamesAgain : MigrationBase("0.75") {

    val log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    @Autowired
    private lateinit var docRepo: DocumentRepository

    override fun exec() {}

    override fun postExec() {
        val pageSize = 100
        var page = 1
        
        ClosableTransaction(transactionManager).use {
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
            
            log.info("Start migration of geo-name")
            
            do {
                log.info("Handling page $page")
                val docs = entityManager.createQuery("SELECT doc FROM Document doc")
                    .setFirstResult((page - 1) * pageSize)
                    .setMaxResults(pageSize)
                    .resultList

                docs
                    .map { it as Document }
                    .filter { docTypesToMigrate.contains(it.type) }
                    .forEach {
                        try {
                            if (migrateGeoName(it)) {
                                log.info("Migrated doc with dbID ${it.id}")
                                docRepo.save(it)
                            }
                        } catch (ex: Exception) {
                            log.error("Error migrating document with dbID ${it.id}", ex)
                        }
                    }
                
                page++
            } while (docs.size == pageSize)
        }
    }

    private fun migrateGeoName(doc: Document): Boolean {
        val geoNameSpatials =
            (doc.data.get("spatial")?.get("references") as ArrayNode? ?: jacksonObjectMapper().createArrayNode())
                .filter { it.get("type")?.asText() == "geo-name" }

        if (geoNameSpatials.isEmpty()) return false

        geoNameSpatials.forEach {
            (it as ObjectNode).put("type", "free")
        }

        return true
    }


    private fun setAuthentication() {
        val auth: Authentication =
            UsernamePasswordAuthenticationToken("Scheduler", "Task", listOf(SimpleGrantedAuthority("cat-admin")))
        SecurityContextHolder.getContext().authentication = auth
    }

}