package de.ingrid.igeserver.profiles.mcloud.types

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.orientechnologies.orient.core.db.ODatabaseSession
import de.ingrid.igeserver.api.ApiException
import de.ingrid.igeserver.db.DBApi
import de.ingrid.igeserver.documenttypes.AbstractDocumentType
import de.ingrid.igeserver.documenttypes.DocumentWrapperType
import de.ingrid.igeserver.services.DocumentService
import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Service

@Service
class mCloudType : AbstractDocumentType(TYPE, profiles) {

    companion object {
        private val log = logger()
        private const val TYPE = "mCloudDoc"
        private val profiles = arrayOf("mcloud")
    }

    override fun initialize(session: ODatabaseSession) {

    }

    @Throws(ApiException::class)
    override fun handleLinkedFields(doc: JsonNode, dbService: DBApi) {
        handleLinkedAddresses(doc)
    }

    override fun mapLatestDocReference(doc: JsonNode, onlyPublished: Boolean, docService: DocumentService) {
        handleLatestsAddresses(doc, onlyPublished, docService)
    }

    private fun handleLatestsAddresses(doc: JsonNode, onlyPublished: Boolean, docService: DocumentService) {
        val addresses = doc.path("addresses")
        for (address in addresses) {
            val wrapperId = address.path("ref").asText()
            try {
                val wrapper = docService.getByDocId(wrapperId, DocumentWrapperType.TYPE, true)
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

    @Throws(ApiException::class)
    private fun handleLinkedAddresses(doc: JsonNode) {

        val addresses = doc.path("addresses")
        for (address in addresses) {
            val id = address.path("ref").path("_id").textValue()
            (address as ObjectNode).put("ref", id)
        }

    }

}