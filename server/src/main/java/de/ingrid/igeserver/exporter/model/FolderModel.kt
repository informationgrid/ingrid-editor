package de.ingrid.igeserver.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty

@JsonIgnoreProperties(ignoreUnknown = true)
data class FolderModel(
    @JsonProperty("_uuid") val uuid: String,
    @JsonProperty("_id") val id: Int,
    @JsonProperty("_type") val docType: String,
    val title: String?,
)