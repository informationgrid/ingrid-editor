package de.ingrid.igeserver.profiles.mcloud.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import de.ingrid.igeserver.exports.interfaces.dcat.Download

@JsonIgnoreProperties(ignoreUnknown = true)
data class DataModel(
    val description: String?,
    val mCloudCategories: List<String>?,
    val DCATThemes: List<String>?, val origin: String?,
    val addresses: List<AddressRefModel>?,
    val accessRights: String?,
    val distributions: List<DownloadModel>?,
    val license: String?,
    @JsonProperty("spatial") val spatials: List<SpatialModel>?,
    val temporal: TimeSpanModel?,
    val periodicity: String?,
    val mfundFKZ: String?,
    val mfundProject: String?,
    val keywords: List<String>?
)
