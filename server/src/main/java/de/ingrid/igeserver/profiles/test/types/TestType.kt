package de.ingrid.igeserver.profiles.mcloud.types

import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.UpdateReferenceOptions
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.FIELD_UUID
import org.apache.logging.log4j.kotlin.logger
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
        return replaceUuidWithReferenceData(doc, "addresses", options)
    }
}
