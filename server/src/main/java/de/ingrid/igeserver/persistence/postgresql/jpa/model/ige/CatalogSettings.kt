package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import de.ingrid.igeserver.api.messaging.IndexMessage

data class CatalogSettings(
    var indexCronPattern: String? = null,
    var lastLogSummary: IndexMessage? = null,
    var exportFormat: String? = null,
    var config: CatalogConfig? = null
)

data class CatalogConfig(
    val partner: String? = null,
    val provider: String? = null,
    val elasticsearchAlias: String? = null
)
