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
package de.ingrid.igeserver.profiles.opendata.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import de.ingrid.igeserver.model.KeyValue

@JsonIgnoreProperties(ignoreUnknown = true)
data class DataModel(
    val description: String?,
    val alternateTitle: String?,
    val DCATThemes: List<KeyValue>?,
    val pointOfContact: List<AddressRefModel>?,
    val qualityProcessURI: String?,
    val legalBasis: String?,
    val distributions: List<DownloadModel>?,
    @JsonProperty("spatial") val spatials: List<SpatialModel>?,
    val politicalGeocodingLevel: KeyValue?,
    val temporal: TimeSpanModel?,
    val periodicity: KeyValue?,
    val keywords: List<String>?
)
