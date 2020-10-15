package de.ingrid.igeserver.profiles.mcloud.types.impl

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.api.InvalidField
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.api.ValidationException
import de.ingrid.igeserver.persistence.model.document.DocumentWrapperType
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.orientdb.OrientDBDocumentEntityType
import de.ingrid.igeserver.profiles.mcloud.types.MCloudType
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.FIELD_ID
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import kotlin.reflect.KClass

@Component
class OMCloudType : BaseMCloudType(), OrientDBDocumentEntityType {

    @Autowired
    private lateinit var docService: DocumentService

    private val log = logger()

    override val entityType: KClass<out EntityType>
        get() = MCloudType::class

    override fun onPublish(doc: JsonNode) {
        // check if all referenced addresses are published
        val addresses = doc.path("addresses")
        for (address in addresses) {
            val wrapperId = address.path("ref").asText()
            val wrapper = docService.getWrapperByDocumentId(wrapperId, true)
                    ?: throw NotFoundException.withMissingResource(wrapperId, DocumentWrapperType::class.simpleName)
            try {
                    // try to find the published version of the linked document
                    docService.getLatestDocument(wrapper, true)
            }
            catch (e: NotFoundException) {
                throw ValidationException.withInvalidFields(InvalidField("addresses", "NOT_PUBLISHED", mapOf("id" to wrapperId)))
            }
        }
    }

    override fun pullReferences(doc: JsonNode): List<JsonNode> {
        return pullLinkedAddresses(doc)
    }

    override fun updateReferences(doc: JsonNode, onlyPublished: Boolean) {
        updateAddresses(doc, onlyPublished)
    }

    private fun pullLinkedAddresses(doc: JsonNode): MutableList<JsonNode> {
        val addressDocs = mutableListOf<JsonNode>()

        val addresses = doc.path("addresses")
        for (address in addresses) {
            val addressDoc = address.path("ref")
            val id = addressDoc.path(FIELD_ID).textValue()

            addressDocs.add(addressDoc)
            (address as ObjectNode).put("ref", id)
        }
        return addressDocs
    }

    private fun updateAddresses(doc: JsonNode, onlyPublished: Boolean) {
        val addresses = doc.path("addresses")
        for (address in addresses) {
            val wrapperId = address.path("ref").asText()
            try {
                val wrapper = docService.getWrapperByDocumentId(wrapperId, true)
                if (wrapper != null) {
                    val latestDocument = docService.getLatestDocument(wrapper, onlyPublished)
                    (address as ObjectNode).replace("ref", latestDocument)
                } else {
                    log.error("Referenced Address could not be found: $wrapperId")
                }
            } catch (e: NotFoundException) {
                // TODO: what to do with removed references?
                log.error("Referenced address was not found: $wrapperId -> Should we remove it?")
                continue
            }
        }
    }
}
