package de.ingrid.igeserver.migrations.tasks

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Query
import de.ingrid.igeserver.repository.DocumentRepository
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.repository.QueryRepository
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
class M078_UpdateInGridLiteratureName : MigrationBase("0.78") {
    val log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    @Autowired
    private lateinit var docRepo: DocumentRepository

    @Autowired
    private lateinit var queryRepo: QueryRepository

    @Autowired
    private lateinit var docWrapper: DocumentWrapperRepository

    override fun exec() {}

    override fun postExec() {
        val pageSize = 100
        var page = 1

        ClosableTransaction(transactionManager).use {
            setAuthentication()

            log.info("Start migration of InGridLiteratureName")

            do {
                log.info("Handling page $page")
                val documentsAndWrappers = entityManager.createQuery(" SELECT dw, doc FROM DocumentWrapper dw, Document doc WHERE dw.uuid = doc.uuid  and dw.type = 'InGridPublication'  order by dw.uuid, doc.uuid ")
                    .setFirstResult((page - 1) * pageSize)
                    .setMaxResults(pageSize)
                    .resultList

                documentsAndWrappers
                    .map { it as Array<*> }  // Cast each result to an Array
                    .map {

                        val documentWrapper = it[0] as DocumentWrapper
                        val document = it[1] as Document

                        // Pair them up or transform them as needed
                        Pair(documentWrapper, document)
                    }
                    .forEach { (documentWrapper, document) ->
                        try {
                            documentWrapper.type = "InGridPublication"
                            log.info("Migrated doc wrapper with dbID ${documentWrapper.id}")
                            docWrapper.save(documentWrapper)

                            document.type = "InGridPublication"
                            log.info("Migrated doc  with dbID ${document.id}")
                            docRepo.save(document)


                        } catch (ex: Exception) {
                            log.error("Error migrating document with dbID ${documentWrapper.id}", ex)
                        }
                    }
                page++
            } while (documentsAndWrappers.size == pageSize)


            page = 1
            do {
                log.info("Handling page $page")
                val queries = entityManager.createQuery("SELECT savedQuery FROM Query savedQuery  ")
                    .setFirstResult((page - 1) * pageSize)
                    .setMaxResults(pageSize)
                    .resultList

                queries
                    .map { it as Query }
                    .forEach {
                        try {



                            val objectMapper = ObjectMapper()
                            val jsonString = it.data.toString()
                            if (jsonString.contains("InGridPublication")) {
                                val updatedJsonString = jsonString.replace("InGridPublication", "InGridPublication")
                                val updatedData: JsonNode = objectMapper.readTree(updatedJsonString)
                                it.data = updatedData
                                queryRepo.save(it)
                                log.info("Migrated query with dbID ${it.id}")
                            }


                        } catch (ex: Exception) {
                            log.error("Error migrating query with dbID ${it.id}", ex)
                        }
                    }

                page++
            } while (queries.size == pageSize)
        }
    }




    private fun setAuthentication() {
        val auth: Authentication =
            UsernamePasswordAuthenticationToken("Scheduler", "Task", listOf(SimpleGrantedAuthority("cat-admin")))
        SecurityContextHolder.getContext().authentication = auth
    }
}