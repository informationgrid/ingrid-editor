package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import de.ingrid.igeserver.api.messaging.IndexMessage

data class CatalogSettings(
    var indexCronPattern: String? = null,
    var lastLogSummary: IndexMessage? = null,
    var exportFormat: String? = null,
    var config: CatalogConfig? = null
)

// TODO refactor for profile specific settings
data class CatalogConfig(
    val partner: String? = null,
    val provider: String? = null,
    val elasticsearchAlias: String? = null,
    var namespace: String? = null,
    var atomDownloadUrl: String? = null,
    var spatialReference: Any? = null,
    val ibus: IBusConfig? = IBusConfig(),
    val expiredDatasetConfig: ExpiredDatasetConfig? = null,
)

data class ExpiredDatasetConfig(
    val emailEnabled: Boolean = false,
    val expiryDuration: Int? = null,
    val notifyDaysBeforeExpiry: Int? = null,
    val repeatExpiry: Boolean = false,
)


@JsonIgnoreProperties(ignoreUnknown = true)
data class IBusConfig(
    val url: String? = null,
    val ip: String = "127.0.0.1",
    val port: Int = 9200,
    val publicationTypes: List<String>? = null
)
