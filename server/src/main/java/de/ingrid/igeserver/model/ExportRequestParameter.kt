package de.ingrid.igeserver.model

data class ExportRequestParameter(
    val id: Int,
    val exportFormat: String,
    val useDraft: Boolean = false
)
