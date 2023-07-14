package de.ingrid.igeserver.profiles.ingrid.exporter.model

data class Thesaurus(
    var name: String? = null,
    var date: String? = null,
    var link: String? = null,
    var showType: Boolean = true,
    var keywords: List<KeywordIso> = emptyList()
)
