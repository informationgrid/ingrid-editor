/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
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
@JsonIgnoreProperties(ignoreUnknown = true)
data class CatalogConfig(
    val partner: String? = null,
    val provider: String? = null,
    val elasticsearchAlias: String? = null,
    var namespace: String? = null,
    var atomDownloadUrl: String? = null,
    var spatialReference: Any? = null,
    val ibus: IBusConfig? = IBusConfig(),
    val expiredDatasetConfig: ExpiredDatasetConfig? = null,
    var codelistFavorites: MutableMap<String, List<String>>? = null
)

data class ExpiredDatasetConfig(
    val emailEnabled: Boolean = false,
    val expiryDuration: Int? = null,
    val notifyDaysBeforeExpiry: Int? = null,
    val repeatExpiry: Boolean = false,
)

data class ConnectionConfig(
    val ibus: List<IBusConfig>? = null,
    val elasticsearch: List<ElasticConfig>? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class IBusConfig(
    val name: String? = null,
    val ip: String = "127.0.0.1",
    val port: Int = 9900,
    @Deprecated("will be stored in catalog") val publicationTypes: List<String>? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class ElasticConfig(
    val ip: String,
    val port: Int = 9300
)
