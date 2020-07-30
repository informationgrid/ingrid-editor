package de.ingrid.igeserver.profiles.mcloud.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

@JsonIgnoreProperties(ignoreUnknown = true)
data class SpatialModel(val type: String, val title: String, val value: BoundingBoxModel) {
    data class BoundingBoxModel(val lat1: Float, val lon1: Float, val lat2: Float, val lon2: Float)
}
