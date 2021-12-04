package de.ingrid.igeserver.profiles.mcloud.types

import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.FIELD_UUID
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.stereotype.Component

@Component
class MCloudType : EntityType() {
    override val className = "mCloudDoc"
    override val profiles = listOf("mcloud").toTypedArray()

    val log = logger()

    @Autowired
    lateinit var docService: DocumentService

    override fun pullReferences(doc: Document): List<Document> {
        return pullLinkedAddresses(doc)
    }

    override fun updateReferences(doc: Document, onlyPublished: Boolean) {
        updateAddresses(doc, onlyPublished)
    }

    private fun pullLinkedAddresses(doc: Document): MutableList<Document> {
        val addressDocs = mutableListOf<Document>()

        val addresses = doc.data.path("addresses")
        for (address in addresses) {
            val addressJson = address.path("ref")
            val uuid = addressJson.path(FIELD_UUID).textValue()
            val addressDoc = docService.convertToDocument(addressJson)
            addressDocs.add(addressDoc)
            (address as ObjectNode).put("ref", uuid)
        }
        return addressDocs
    }

    private fun updateAddresses(doc: Document, onlyPublished: Boolean) {
        val addresses = doc.data.path("addresses")
        for (address in addresses) {
            val uuid = if (address.path("ref").isTextual) {
                address.path("ref").asText()
            } else {
                // fix used because references have not been saved with ID but full address
                // this can be removed later
                log.warn("Address reference is stored in a wrong way")
                address.path("ref").path(FIELD_UUID).asText()
            }
            try {
                // FIXME: we need to call getWrapperByDocumentIdAndCatalog
                val wrapper = docService.getWrapperByCatalogAndDocumentUuid(doc.catalog?.identifier!!, uuid)
                val latestDocument = docService.getLatestDocument(wrapper, onlyPublished)
                val latestDocumentJson = docService.convertToJsonNode(latestDocument)
                (address as ObjectNode).replace("ref", latestDocumentJson)
            } catch (e: EmptyResultDataAccessException) {
                // TODO: what to do with removed references?
                log.error("Referenced address was not found: $uuid -> Should we remove it?")
                continue
            }
        }
    }
}
