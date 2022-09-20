package de.ingrid.igeserver.model

data class ExportRequestParameter(
    val id: String,
    val exportFormat: String,
    val useDraft: Boolean = false
)
