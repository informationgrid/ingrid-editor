package de.ingrid.igeserver.profiles.bmi.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import de.ingrid.igeserver.exports.interfaces.dcat.Download

@JsonIgnoreProperties(ignoreUnknown = true)
data class DataModel(
    val description: String?,
    val DCATThemes: List<String>?, val origin: String?,
    val addresses: List<AddressRefModel>?,
    val legalBasis: String?,
    val distributions: List<DownloadModel>?,
    val license: KeyValueModel?,
    @JsonProperty("spatial") val spatials: List<SpatialModel>?,
    val temporal: TimeSpanModel?,
    val periodicity: KeyValueModel?,
    val keywords: List<String>?
)
