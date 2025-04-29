package de.ingrid.igeserver.services

sealed class CodelistField {
    data class SingleField(
        val field: String?,
        val codelist: String,
    ) : CodelistField()

    data class ListField(
        val arrayField: String? = null,
        val subField: String?,
        val codelist: String,
    ) : CodelistField()
}
