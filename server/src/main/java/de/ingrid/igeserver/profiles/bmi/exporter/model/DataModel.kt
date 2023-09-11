package de.ingrid.igeserver.profiles.bmi.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty

@JsonIgnoreProperties(ignoreUnknown = true)
data class DataModel(
    val description: String?,
    val landingPage: String?,
    val DCATThemes: List<KeyValueModel>?,
    val addresses: List<AddressRefModel>?,
    val qualityProcessURI: String?,
    val legalBasis: String?,
    val distributions: List<DownloadModel>?,
    @JsonProperty("spatial") val spatials: List<SpatialModel>?,
    val politicalGeocodingLevel: KeyValueModel?,
    val temporal: TimeSpanModel?,
    val periodicity: KeyValueModel?,
    val keywords: List<String>?
)
