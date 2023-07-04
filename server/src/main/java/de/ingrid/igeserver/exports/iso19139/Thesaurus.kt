package de.ingrid.igeserver.exports.iso19139

data class Thesaurus(
    var name: String? = null,
    var date: String? = null,
    var link: String? = null,
    var showType: Boolean = true,
    var keywords: List<Keyword> = emptyList()
)
