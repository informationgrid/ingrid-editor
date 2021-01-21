package de.ingrid.igeserver.model

import com.fasterxml.jackson.annotation.JsonAlias
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.databind.JsonNode

/**
 * Group
 */
@JsonIgnoreProperties(ignoreUnknown = true)
data class Group(
    var id: String?,
    val name: String,
    val description: String?,
    val permissions: JsonNode
) {

    //    @get:JsonIgnore
    val _type: String
        get() {
            return "PermissionsData"
        }

}
