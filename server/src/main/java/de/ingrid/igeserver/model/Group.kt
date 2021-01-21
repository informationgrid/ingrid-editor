package de.ingrid.igeserver.model

import com.fasterxml.jackson.annotation.JsonAlias
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.databind.JsonNode

/**
 * Group
 */
@JsonIgnoreProperties(ignoreUnknown = true)
data class Group(
    val name: String,
    val description: String?,
    val permissions: JsonNode,
    @JsonAlias("id") private val _id: String?
) {

    // generate id from name, which is done only for a new group
    val id: String
        get() {
            return _id ?: return name
                .toLowerCase()
                .filter { !it.isWhitespace() }
        }

    //    @get:JsonIgnore
    val _type: String
        get() {
            return "PermissionsData"
        }

}
