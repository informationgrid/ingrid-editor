package de.ingrid.igeserver.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.databind.JsonNode

/**
 * Group
 */
@JsonIgnoreProperties(ignoreUnknown = true)
data class Group(val name: String, val description: String?, val permissions: JsonNode, val _type: String = "PermissionsData") {
    
    val id: String
    get() { return name }
    
}
