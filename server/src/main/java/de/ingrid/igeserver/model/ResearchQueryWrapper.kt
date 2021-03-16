package de.ingrid.igeserver.model

data class ResearchQueryWrapper(
    val id: String,
    val type: String,
    val title: String,
    val description: String,
    val definition: ResearchQuery
)
