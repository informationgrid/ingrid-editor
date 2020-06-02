package de.ingrid.igeserver.profiles.mcloud.types

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.orientechnologies.orient.core.db.ODatabaseSession
import com.orientechnologies.orient.core.metadata.schema.OType
import de.ingrid.igeserver.api.ApiException
import de.ingrid.igeserver.db.DBApi
import de.ingrid.igeserver.documenttypes.AddressWrapperType
import de.ingrid.igeserver.documenttypes.DocumentType
import de.ingrid.igeserver.services.DocumentService
import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Service

@Service
class mCloudType : DocumentType(TYPE, profiles) {

    companion object {
        private val log = logger()
        private const val TYPE = "mCloudDoc"
        private val profiles = arrayOf("mcloud")
    }

    override fun initialize(session: ODatabaseSession) {
        val schema = session.metadata.schema
        if (!schema.existsClass(TYPE)) {
            log.debug("Create class $TYPE")
            val clazz = schema.createClass(TYPE)
            clazz.createProperty("_id", OType.STRING)
            clazz.createProperty("_parent", OType.STRING)
        }
    }

    @Throws(ApiException::class)
    override fun handleLinkedFields(doc: JsonNode?, dbService: DBApi?) {
        handleLinkedAddresses(doc)
    }

    override fun mapLatestDocReference(doc: JsonNode?, docService: DocumentService?) {
        handleLatestsAddresses(doc, docService)
    }

    private fun handleLatestsAddresses(doc: JsonNode?, docService: DocumentService?) {
        val addresses = doc!!.path("addresses")
        for (address in addresses) {
            val wrapperId = address.path("ref").asText()
            var wrapper: JsonNode?
            try {
                wrapper = docService!!.getByDocId(wrapperId, AddressWrapperType.TYPE, true)
                val latestDocument = docService.getLatestDocument(wrapper)
                (address as ObjectNode).put("ref", latestDocument)
            } catch (e: Exception) {
                log.error(e)
            }
        }
    }

    @Throws(ApiException::class)
    private fun handleLinkedAddresses(doc: JsonNode?) {
        val addresses = doc!!.path("addresses")
        for (address in addresses) {
            val id = address.path("ref").path("_id").textValue()
            (address as ObjectNode).put("ref", id)
        }
    }

}