package de.ingrid.igeserver.migrations.tasks

import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.ObjectNode
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
class M043_MigrateCodelist20003 : MigrationBase("0.43") {

    val log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    @Autowired
    private lateinit var docRepo: DocumentRepository

    val source =
        listOf("API", "AtomFeed", "Dateidownload", "FTP", "Portal", "Software", "SOS", "WCS", "WFS", "WMS", "WMTS")
    val target =
        listOf("api", "atomFeed", "download", "ftp", "portal", "software", "sos", "wcs", "wfs", "wms", "wmts")

    override fun exec() {}

    override fun postExec() {
        ClosableTransaction(transactionManager).use {
            val docs = entityManager.createQuery("SELECT doc FROM Document doc WHERE doc.type='mCloudDoc'").resultList
            setAuthentication()

            docs.forEach { doc ->
                doc as Document
                try {
                    migrateDistributionType(doc)
                    docRepo.save(doc)
                } catch (ex: Exception) {
                    log.error("Error migrating document with dbID ${doc.id}", ex)
                }
            }
        }
    }

    private fun migrateDistributionType(doc: Document) {
        val array = doc.data.get("distributions") ?: return
        if (array.isNull) return

        array as ArrayNode

        array.forEach { item ->
            val fieldElement = item.get("type") ?: return
            if (fieldElement.isNull) return

            fieldElement as ObjectNode

            val value = fieldElement.get("key")
            if (value.isNull) return

            fieldElement.put("key", convertType(value.textValue()))
        }
    }

    private fun convertType(value: String): String {
        val index = source.indexOf(value)
        return target.get(index)
    }

    private fun setAuthentication() {
        val auth: Authentication =
            UsernamePasswordAuthenticationToken("Scheduler", "Task", listOf(SimpleGrantedAuthority("cat-admin")))
        SecurityContextHolder.getContext().authentication = auth
    }

}
