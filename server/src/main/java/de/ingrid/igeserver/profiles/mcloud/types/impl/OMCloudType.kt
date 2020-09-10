package de.ingrid.igeserver.profiles.mcloud.types.impl

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.api.ApiException
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.api.PublishedVersionNotFoundException
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
class OMCloudType : OrientDBDocumentEntityType {

    @Autowired
    private lateinit var docService: DocumentService

    private val log = logger()

    companion object {
        private const val TYPE = "mCloudDoc"
        private val PROFILES = arrayOf("mcloud")
    }

    override val profiles: Array<String>
        get() = PROFILES

    override val className: String
        get() = TYPE

    override val entityType: KClass<out EntityType>
        get() = MCloudType::class

    override fun onPublish(doc: JsonNode) {
        // check if all referenced addresses are published
        val addresses = doc.path("addresses")
        for (address in addresses) {
            val wrapperId = address.path("ref").asText()
            try {
                val wrapper = docService.getByDocumentId(wrapperId, DocumentWrapperType::class, true)
                if (wrapper != null) {
                    // try to find published version of the linked document
                    docService.getLatestDocument(wrapper, true)
                } else {
                    throw NotFoundException("Referenced Address could not be found: $wrapperId")
                }
            } catch (e: Exception) {
                val ex = ApiException("Failed to check publish state of references in document '${doc.get("title")}' with ID '${doc.get(FIELD_ID).asText()}': ${e.message}", true)
                log.error(ex)
                throw ex
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
                val wrapper = docService.getByDocumentId(wrapperId, DocumentWrapperType::class, true)
                if (wrapper != null) {
                    val latestDocument = docService.getLatestDocument(wrapper, onlyPublished)
                    (address as ObjectNode).replace("ref", latestDocument)
                } else {
                    log.error("Referenced Address could not be found: $wrapperId")
                }
            } catch (e: Exception) {
                // TODO: what to do with removed references?
                if (e is NotFoundException) {
                    log.error("Referenced address was not found: $wrapperId -> Should we remove it?")
                    continue
                } else if (e is PublishedVersionNotFoundException) {
                    throw ApiException("Problem with referenced addresses of document '${doc.get("title")}' with ID '${doc.get(FIELD_ID).asText()}': ${e.message}", true)
                }
                log.error(e)
                throw e
            }
        }
    }
}