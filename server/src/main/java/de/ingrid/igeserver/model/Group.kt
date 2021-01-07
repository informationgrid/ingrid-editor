package de.ingrid.igeserver.model

import com.fasterxml.jackson.databind.JsonNode

/**
 * Role
 */
data class Group(val name: String, val permissions: JsonNode)
