package de.ingrid.igeserver.profiles.mcloud.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import de.ingrid.igeserver.exports.interfaces.dcat.DCAT

@JsonIgnoreProperties(ignoreUnknown = true)
data class MCloudModel(
        @JsonProperty("_id") override val uuid: String,
        override val title: String,
        override val description: String?,
        val theme: String?,
        @JsonProperty("_created") val created: String,
        @JsonProperty("_modified") val modified: String,
        val origin: String?,
        val addresses: List<AddressRefModel>?,
        val usage: String?,
        override val downloads: List<DownloadModel>?,
        val categories: List<String>?,
        override val license: String?,
        @JsonProperty("geoReferenceVisual") val spatials: List<SpatialModel>?,
        val timeSpan: RangeModel?,
        val periodicity: String?,
        val mfundFKZ: String?,
        val mfundProject: String?
): DCAT {

    override val publisher: AddressModel?
    get() {
        return addresses
                ?.firstOrNull { it.type == "10" }
                ?.ref;
    }

    val hasSingleSpatial: Boolean
    get() = spatials?.size == 1

    val spatialTitels: List<String>?
    get() = spatials?.map { it.title }?.filterNotNull()

    val allData: List<String>?
    get() {
        if (mfundFKZ != null || mfundProject != null) {
            val result = mutableListOf("mfund")
            if (mfundFKZ != null) {
                result.add("mFUND-FKZ: $mfundFKZ")
            }
            if (mfundProject != null) {
                result.add("mFUND-Projekt: $mfundProject")
            }
            return result
        }
        return null
    }

    fun isValid(): Boolean {
        // TODO: implement
        return true
    }
}