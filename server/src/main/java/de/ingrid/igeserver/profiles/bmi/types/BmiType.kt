package de.ingrid.igeserver.profiles.bmi.types

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.UpdateReferenceOptions
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.FIELD_UUID
import org.apache.logging.log4j.kotlin.logger
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.stereotype.Component
import java.net.URLDecoder

@Component
class BmiType : EntityType() {
    override val className = "bmiDoc"
    override val profiles = arrayOf("bmi")

    val log = logger()

    override val jsonSchema = "/bmi/schemes/bmi.schema.json"

    override fun pullReferences(doc: Document): List<Document> {
        return pullLinkedAddresses(doc)
    }

    override fun updateReferences(doc: Document, options: UpdateReferenceOptions) {
        updateAddresses(doc, options)
    }

    override fun getUploads(doc: Document): List<String> {
        if (doc.data.get("distributions") != null) {
            val files = doc.data.get("distributions")
                .filter { download -> !download.get("link").get("asLink").booleanValue() }
                .map { download -> getUploadFile(download) }

            return files
        }
        return emptyList()
    }

    private fun getUploadFile(download: JsonNode): String {
        if (download.get("link").get("uri") !== null) {
            return URLDecoder.decode(download.get("link").get("uri").textValue()!!, "utf-8")
        } else {
            return download.get("link").get("value").textValue()
        }
    }

    private fun pullLinkedAddresses(doc: Document): MutableList<Document> {
        val addressDocs = mutableListOf<Document>()

        val addresses = doc.data.path("addresses")
        for (address in addresses) {
            val addressJson = address.path("ref")
            // during import address already is replaced by UUID
            // TODO: improve import process so we don't need this
            if (addressJson is ObjectNode) {
                val uuid = addressJson.path(FIELD_UUID).textValue()
                val addressDoc = documentService.convertToDocument(addressJson)
                addressDocs.add(addressDoc)
                (address as ObjectNode).put("ref", uuid)
            }
        }
        return addressDocs
    }

    override fun getReferenceIds(doc: Document): List<String> {
        return doc.data.path("addresses").map { address ->
            address.path("ref").textValue()
        }
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
                val latestDocumentJson = getDocumentForReferenceUuid(doc.catalogIdentifier!!, uuid, options)
                (address as ObjectNode).replace("ref", latestDocumentJson)
            } catch (e: EmptyResultDataAccessException) {
                // TODO: what to do with removed references?
                log.error("Referenced address was not found: $uuid -> Should we remove it?")
                continue
            }
        }
    }
}
