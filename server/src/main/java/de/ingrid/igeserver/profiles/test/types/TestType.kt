package de.ingrid.igeserver.profiles.mcloud.types

import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.UpdateReferenceOptions
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.FIELD_UUID
import org.apache.logging.log4j.kotlin.logger
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.stereotype.Component

@Component
class TestType : EntityType() {

    override val className = "TestDoc"
    override val profiles = listOf("mcloud", "test").toTypedArray()

    val log = logger()

    override fun usedInProfile(profileId: String): Boolean {
        return false
    }

    override fun pullReferences(doc: Document): List<Document> {
        return pullLinkedAddresses(doc)
    }

    override fun updateReferences(doc: Document, options: UpdateReferenceOptions) {
        updateAddresses(doc, options)
    }

    private fun pullLinkedAddresses(doc: Document): MutableList<Document> {
        val addressDocs = mutableListOf<Document>()

        val addresses = doc.data.path("addresses")
        for (address in addresses) {
            val addressJson = address.path("ref")
            val uuid = addressJson.path(FIELD_UUID).textValue()
            val addressDoc = documentService.convertToDocument(addressJson)
            addressDocs.add(addressDoc)
            (address as ObjectNode).put("ref", uuid)
        }
        return addressDocs
    }

    private fun updateAddresses(doc: Document, options: UpdateReferenceOptions) {
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
                val latestDocumentJson = getDocumentForReferenceUuid(doc.catalog!!.identifier, uuid, options)
                (address as ObjectNode).replace("ref", latestDocumentJson)
            } catch (e: EmptyResultDataAccessException) {
                // TODO: what to do with removed references?
                log.error("Referenced address was not found: $uuid -> Should we remove it?")
                continue
            }
        }
    }
}
