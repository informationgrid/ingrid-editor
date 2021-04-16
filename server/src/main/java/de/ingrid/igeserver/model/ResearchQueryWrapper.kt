package de.ingrid.igeserver.model

import com.fasterxml.jackson.databind.JsonNode

data class ResearchQueryWrapper(
    val id: String,
    val type: String,
    val title: String,
    val description: String,
    val term: String,
    val model: JsonNode,
    val parameter: JsonNode
)
