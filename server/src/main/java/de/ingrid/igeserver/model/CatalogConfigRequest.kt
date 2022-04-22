package de.ingrid.igeserver.model

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.CatalogConfig

data class CatalogConfigRequest(
    val name: String?,
    val description: String?,
    val config: CatalogConfig
)
