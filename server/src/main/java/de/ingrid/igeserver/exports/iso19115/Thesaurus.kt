package de.ingrid.igeserver.exports.iso19115

data class Thesaurus(
    var name: String? = null,
    var date: String? = null,
    var link: String? = null,
    var keywords: List<Keyword> = emptyList()
)
