package de.ingrid.igeserver.services.thesaurus

data class Keyword(
    val id: String,
    val label: String
)

data class ThesaurusSearchOptions(
    val searchType: ThesaurusSearchType
)

enum class ThesaurusSearchType {
    EXACT, BEGINS_WITH, ENDS_WITH, CONTAINS
}
