package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper

open class MapperService {

    fun getJsonNode(json: String): JsonNode {
        val mapper = jacksonObjectMapper()
        mapper.configure(SerializationFeature.INDENT_OUTPUT, true)
        return mapper.readTree(json)
    }

}