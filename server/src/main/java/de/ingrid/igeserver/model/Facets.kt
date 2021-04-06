package de.ingrid.igeserver.model

data class Facets(
    val addresses: Array<FacetGroup>,
    val documents: Array<FacetGroup>
)