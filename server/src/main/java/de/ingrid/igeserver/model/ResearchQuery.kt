package de.ingrid.igeserver.model

data class ResearchQuery(val term: String?, val clauses: BoolFilter?)

data class BoolFilter(
    val op: String,
    val value: List<String>?,
    val clauses: List<BoolFilter>?,
    val parameter: List<String?>?
)
