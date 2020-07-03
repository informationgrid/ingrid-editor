package de.ingrid.igeserver.services

import kotlin.jvm.Throws
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.core.JsonProcessingException
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.model.Behaviour
import java.lang.Exception

open class MapperService {
    companion object {

        @JvmStatic
        @Throws(Exception::class)
        fun getJsonNode(json: String): JsonNode {
            val mapper = jacksonObjectMapper()
            mapper.configure(SerializationFeature.INDENT_OUTPUT, true)
            return mapper.readTree(json)
        }

        @Throws(JsonProcessingException::class)
        fun getJsonNodeFromClass(clazz: Behaviour): String {
            val objectMapper = jacksonObjectMapper()
            return objectMapper.writeValueAsString(clazz)
        }

        /**
         * Remove all fields add by database for internal management. Those are @rid, @class, @type, @fieldTypes.
         *
         * @param node
         */
        @JvmStatic
        fun removeDBManagementFields(node: ObjectNode) {
            node.remove("@rid")
            node.remove("@class")
            node.remove("@type")

            // map version info to our own model
            node.put(FIELD_VERSION, node.get("@version").asText())
            node.remove("@version")
        }
    }
}