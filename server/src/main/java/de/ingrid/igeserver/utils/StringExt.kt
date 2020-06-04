package de.ingrid.igeserver.utils

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper

fun String.toJsonNode(): JsonNode {
    val mapper = jacksonObjectMapper()
    mapper.configure(SerializationFeature.INDENT_OUTPUT, true)
    return mapper.readTree(this)
}
