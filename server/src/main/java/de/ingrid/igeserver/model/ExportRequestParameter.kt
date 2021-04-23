package de.ingrid.igeserver.model

import com.fasterxml.jackson.annotation.JsonProperty

class ExportRequestParameter(
    @JsonProperty("id") val id: String,
    @JsonProperty("exportFormat") val exportFormat: String,
    @JsonProperty("useDraft") val isUseDraft: Boolean = false
)
