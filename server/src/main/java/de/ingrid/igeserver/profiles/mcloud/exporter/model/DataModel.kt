package de.ingrid.igeserver.profiles.mcloud.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import de.ingrid.igeserver.exports.interfaces.dcat.Download

@JsonIgnoreProperties(ignoreUnknown = true)
data class DataModel(
    val description: String?,
    val mCloudCategories: List<String>?,
    val openDataCategories: List<String>?, val origin: String?,
    val addresses: List<AddressRefModel>?,
    val usage: String?,
    val downloads: List<DownloadModel>?,
    val license: String?,
    @JsonProperty("geoReferenceVisual") val spatials: List<SpatialModel>?,
    val timeSpan: TimeSpanModel?,
    val periodicity: String?,
    val mfundFKZ: String?,
    val mfundProject: String?
)
