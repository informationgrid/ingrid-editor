package de.ingrid.igeserver.profiles.mcloud.types.impl

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
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

@Component()
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

    override fun handleLinkedFields(doc: JsonNode): List<JsonNode> {
        return handleLinkedAddresses(doc)
    }

    override fun mapLatestDocReference(doc: JsonNode, onlyPublished: Boolean) {
        handleLatestAddresses(doc, onlyPublished)
    }

    private fun handleLatestAddresses(doc: JsonNode, onlyPublished: Boolean) {
        val addresses = doc.path("addresses")
        for (address in addresses) {
            val wrapperId = address.path("ref").asText()
            try {
                val wrapper = docService.getByDocId(wrapperId, DocumentWrapperType::class, true)
                if (wrapper != null) {
                    val latestDocument = docService.getLatestDocument(wrapper, onlyPublished)
                    (address as ObjectNode).replace("ref", latestDocument)
                } else {
                    log.error("Referenced Address could not be found: $wrapperId")
                }
            } catch (e: Exception) {
                log.error(e)
                throw e
            }
        }
    }

    private fun handleLinkedAddresses(doc: JsonNode): MutableList<JsonNode> {
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
}