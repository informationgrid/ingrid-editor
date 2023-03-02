package de.ingrid.igeserver.profiles.mcloud.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty

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
