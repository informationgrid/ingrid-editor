package de.ingrid.igeserver.model

data class ResearchQuery(val term: String?, val clauses: BoolFilter?, val orderByField: String? = "title", val orderByDirection: String? = "ASC")

data class BoolFilter(
    val op: String,
    val value: List<String>?,
    val clauses: List<BoolFilter>?,
    val parameter: List<String?>?
)
