package de.ingrid.igeserver.migrations.tasks

import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.bmi.BmiProfile
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.DocumentRepository
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.context.annotation.Profile
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Profile("bmi")
@Service
class M072_UpdateBmiCatalog : MigrationBase("0.72") {

    val log = logger()

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var docRepo: DocumentRepository

    @Autowired
    private lateinit var catalogRepo: CatalogRepository

    @Qualifier("bmiProfile")
    @Autowired
    private lateinit var bmiProfile: BmiProfile

    override fun exec() {
        ClosableTransaction(transactionManager).use {
            catalogRepo.findAllByType("bmi").forEach { catalog ->
                bmiProfile.codelistHandler.removeCodelist(catalog.identifier, "20002")
                bmiProfile.initCatalogCodelists(catalog.identifier)
            }
        }
    }

    override fun postExec() {
        ClosableTransaction(transactionManager).use {
            val docs = entityManager.createQuery("SELECT doc FROM Document doc").resultList
            val docTypesToMigrate = listOf(
                    "BmiDoc"
            )
            setAuthentication()

            docs
                    .map { it as Document }
                    .filter { docTypesToMigrate.contains(it.type) }
                    .forEach {
                        try {
                            if (migrateDocument(it)) {
                                log.info("Migrated doc with dbID ${it.id}")
                                docRepo.save(it)
                            }
                        } catch (ex: Exception) {
                            log.error("Error migrating document with dbID ${it.id}", ex)
                        }
                    }
        }
    }

    private fun setAuthentication() {
        val auth: Authentication =
                UsernamePasswordAuthenticationToken("Scheduler", "Task", listOf(SimpleGrantedAuthority("cat-admin")))
        SecurityContextHolder.getContext().authentication = auth
    }

    private fun migrateDocument(doc: Document): Boolean {
        var migrated = false
        if(migrateGeoName(doc)) migrated = true
        if(migrateDcatTheme(doc)) migrated = true
        if(migrateAddressTypes(doc)) migrated = true
        if(migrateLicense(doc)) migrated = true
        if(migrateOriginator(doc)) migrated = true

        return migrated
    }


    private fun migrateGeoName(doc: Document): Boolean {
        val geoNameSpatials =
                (doc.data.get("spatial") as ArrayNode? ?: jacksonObjectMapper().createArrayNode())
                        .filter { it.get("type")?.asText() == "geo-name" }

        if (geoNameSpatials.isEmpty()) return false

        geoNameSpatials.forEach {
            (it as ObjectNode).put("type", "free")
        }

        return true
    }

    private fun migrateDcatTheme(doc: Document): Boolean {
        val simpleThemes: ArrayNode =
                doc.data.get("DCATThemes") as ArrayNode? ?: jacksonObjectMapper().createArrayNode()

        if (simpleThemes.isEmpty()) return false

        val keyThemes = jacksonObjectMapper().createArrayNode().apply {
            simpleThemes.forEach {
                add(jacksonObjectMapper().createObjectNode().apply {
                    put("key", it.asText())
                })
            }
        }

        doc.data.set<ArrayNode>("DCATThemes", keyThemes)
        return true
    }

    private fun migrateAddressTypes(doc: Document): Boolean {
        val adresses =
                (doc.data.get("addresses") as ArrayNode? ?: jacksonObjectMapper().createArrayNode())

        if (adresses.isEmpty()) return false

        adresses.forEach {
            val oldAddressType = (it as ObjectNode).get("key").textValue()
            val newAddressType = mapAddressType(oldAddressType)
            (it as ObjectNode).put("key", newAddressType)
        }

        return true
    }

    private fun mapAddressType(oldKey: String) : String {
        when(oldKey){
            "10" -> return "publisher"
            "11" -> return "creator"
            "9" -> return "creator"
            "6" -> return "originator"
            "2" -> return "maintainer"
            else -> return oldKey
        }
    }

    private fun migrateLicense(doc: Document): Boolean {
        val license =
                (doc.data.get("license") as ObjectNode? ?: jacksonObjectMapper().createObjectNode())

        val distributions =
                (doc.data.get("distributions") as ArrayNode? ?: jacksonObjectMapper().createArrayNode())



        if (distributions.isEmpty() && license == null ) return false

        distributions.forEach {
            (it as ObjectNode).set<ObjectNode>("license", license)
        }

        doc.data.remove("license")

        return true
    }

    private fun migrateOriginator(doc: Document): Boolean {
        val origin =
                (doc.data.get("origin") as ObjectNode? ?: jacksonObjectMapper().createObjectNode())

        val distributions =
                (doc.data.get("distributions") as ArrayNode? ?: jacksonObjectMapper().createArrayNode())



        if (distributions.isEmpty() && origin == null && origin?.asText()?.isEmpty() == true) return false

        distributions.forEach {
            (it as ObjectNode).set<ObjectNode>("byClause", origin)
        }

        doc.data.remove("origin")

        return true
    }
}
