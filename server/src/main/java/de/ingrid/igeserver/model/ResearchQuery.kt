package de.ingrid.igeserver.model

data class ResearchQuery(
    val term: String?,
    val clauses: BoolFilter?,
    val orderByField: String? = "title",
    val orderByDirection: String? = "ASC",
    val pagination: ResearchPaging = ResearchPaging()
)

data class BoolFilter(
    val op: String,
    val value: List<String>?,
    val clauses: List<BoolFilter>?,
    val parameter: List<String?>?,
    val isFacet: Boolean = true
)

data class ResearchPaging(
    val page: Int = 1,
    val pageSize: Int = Int.MAX_VALUE,
    val offset: Int = 0
)