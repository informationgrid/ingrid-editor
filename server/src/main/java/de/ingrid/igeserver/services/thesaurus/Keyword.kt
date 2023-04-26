package de.ingrid.igeserver.services.thesaurus

data class Keyword(
    val id: String,
    val label: String,
    val alternativeLabel: String? = null
) {
    // two keywords are equal when "id" and "label" are equal
    override fun equals(other: Any?): Boolean {
        if (other !is Keyword) return false
        return KeywordEssential(this) == KeywordEssential(other)
    }

    override fun hashCode() = KeywordEssential(this.id, this.label).hashCode()
}

private data class KeywordEssential(
    val id: String,
    val label: String
) {
    constructor(keyword: Keyword) : this(keyword.id, keyword.label)
}

data class ThesaurusSearchOptions(
    val searchType: ThesaurusSearchType
)

enum class ThesaurusSearchType {
    EXACT, BEGINS_WITH, ENDS_WITH, CONTAINS
}
