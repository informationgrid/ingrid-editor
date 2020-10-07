package de.ingrid.igeserver.profiles.mcloud.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

@JsonIgnoreProperties(ignoreUnknown = true)
data class SpatialModel(val type: String?, val title: String?, val value: BoundingBoxModel?, val wkt: String?) {

    data class BoundingBoxModel(val lat1: Float, val lon1: Float, val lat2: Float, val lon2: Float)

    val polygon: String?
        get() {
            return when (type) {
                "free" -> getFreeCoordinates()
                "wkt" -> getWktCoordinates()
                else -> null
            }
        }

    private fun getFreeCoordinates(): String? {
        if (value == null) {
            return null
        }

        return "[[${value.lon1}, ${value.lat1}], [${value.lon2}, ${value.lat1}], [${value.lon2}, ${value.lat2}], [${value.lon1}, ${value.lat2}], [${value.lon1}, ${value.lat1}]]"

    }

    private fun getWktCoordinates(): String? {
        TODO("Not yet implemented")
    }
}
