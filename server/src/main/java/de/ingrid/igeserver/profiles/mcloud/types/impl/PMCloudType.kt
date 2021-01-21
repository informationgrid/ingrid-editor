package de.ingrid.igeserver.profiles.mcloud.types.impl

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.postgresql.PostgreSQLEntityType
import de.ingrid.igeserver.persistence.postgresql.jpa.EmbeddedData
import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.EntityBase
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.mcloud.types.MCloudType
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.FIELD_ID
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import kotlin.reflect.KClass

@Component
class PMCloudType : BaseMCloudType(), PostgreSQLEntityType {
    
    val log = logger()
    
    @Autowired
    lateinit var docService: DocumentService

    override val entityType: KClass<out EntityType>
        get() = MCloudType::class

    override val jpaType: KClass<out EntityBase>
        get() = Document::class

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

/**
 * EmbeddedData type used by Document instances with mCloudDoc data
 */
@Component
class MCloudData : HashMap<String, Any?>(), EmbeddedData {

    companion object {
        @JvmStatic
        protected val TYPE_NAME = BaseMCloudType().className
    }

    @get:JsonIgnore
    override val typeColumnValue: String
        get() = TYPE_NAME
}
