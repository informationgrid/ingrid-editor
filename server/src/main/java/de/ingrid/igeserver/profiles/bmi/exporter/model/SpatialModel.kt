package de.ingrid.igeserver.profiles.bmi.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import org.apache.logging.log4j.kotlin.logger

@JsonIgnoreProperties(ignoreUnknown = true)
data class SpatialModel(val type: String?, val title: String?, val value: BoundingBoxModel?, val wkt: String?, val ars: String?) {

    val log = logger()

    data class BoundingBoxModel(val lat1: Float, val lon1: Float, val lat2: Float, val lon2: Float)

    val polygon: String?
        get() {
            return when (type) {
                "free" -> getFreeCoordinates()
                "wfsgnde" -> getFreeCoordinates()
                "wkt" -> getWktCoordinates()
                else -> null
            }
        }

    val geoType: String?
        get() {
            return when (type) {
                "free" -> "polygon"
                "wfsgnde" -> "polygon"
                "wkt" -> getWktType()
                else -> null
            }
        }

    private fun getFreeCoordinates(): String? {
        if (value == null) {
            return null
        }

        return "[[[${value.lon1}, ${value.lat1}], [${value.lon2}, ${value.lat1}], [${value.lon2}, ${value.lat2}], [${value.lon1}, ${value.lat2}], [${value.lon1}, ${value.lat1}]]]"

    }

    private fun getWktCoordinates(): String? {
        if (this.wkt != null) {
            try{
                var coordsPos = wkt.indexOf("(")
                var coords = wkt.substring(coordsPos).trim()
                coords = coords.replace("\n", " ")
                coords = coords.replace("\\(".toRegex(), "[").replace("\\)".toRegex(), "]")
                coords = coords.replace("\\[(\\s*[-0-9][^\\]]*\\,[^\\]]*[0-9]\\s*)\\]".toRegex(), "[[$1]]")
                coords = coords.replace("([0-9])\\s*\\,\\s*([-0-9])".toRegex(), "$1], [$2")
                coords = coords.replace("([0-9])\\s+([-0-9])".toRegex(), "$1, $2")

                return coords
            } catch (ex:Exception){
                log.error(ex)
            }
        }

        return null
    }

    private fun getWktType(): String? {
        if (this.wkt != null) {
            try{
                var coordsPos = wkt.indexOf("(")
                var wktType = wkt.substring(0, coordsPos).trim().lowercase()

                return wktType
            } catch (ex:Exception){
                log.error(ex)
            }
        }

        return null
    }
}
