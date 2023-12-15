/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.mcloud.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import de.ingrid.igeserver.exporter.model.AddressRefModel
import de.ingrid.igeserver.exporter.model.KeyValueModel
import de.ingrid.igeserver.exporter.model.SpatialModel
import de.ingrid.igeserver.exporter.model.TimeSpanModel

@JsonIgnoreProperties(ignoreUnknown = true)
data class DataModel(
    val description: String?,
    val mCloudCategories: List<String>?,
    val DCATThemes: List<String>?, val origin: String?,
    val addresses: List<AddressRefModel>?,
    val accessRights: String?,
    val distributions: List<DownloadModel>?,
    val license: KeyValueModel?,
    @JsonProperty("spatial") val spatials: List<SpatialModel>?,
    val temporal: TimeSpanModel?,
    val periodicity: KeyValueModel?,
    val mfundFKZ: String?,
    val mfundProject: String?,
    val keywords: List<String>?
)
