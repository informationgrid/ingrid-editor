package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.model.Behaviour
import org.springframework.stereotype.Component

open class MapperService {

    fun getJsonNode(json: String): JsonNode {
        val mapper = jacksonObjectMapper()
        mapper.configure(SerializationFeature.INDENT_OUTPUT, true)
        return mapper.readTree(json)
    }

    fun getJsonNodeFromClass(clazz: Behaviour): String {
        val objectMapper = jacksonObjectMapper()
        return objectMapper.writeValueAsString(clazz)
    }
}