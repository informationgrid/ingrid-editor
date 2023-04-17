package de.ingrid.igeserver.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import de.ingrid.igeserver.utils.convertWktToGml32
import org.apache.logging.log4j.LogManager

@JsonIgnoreProperties(ignoreUnknown = true)
data class SpatialModel(val type: String?, val title: String?, val value: BoundingBoxModel?, val wkt: String?) {

    companion object {
        private val log = LogManager.getLogger()
    }

    data class BoundingBoxModel(val lat1: Float, val lon1: Float, val lat2: Float, val lon2: Float)

    val polygon: String?
        get() {
            return when (type) {
                "free" -> getFreeCoordinates()
                "wkt" -> getWktCoordinates()
                else -> null
            }
        }

    val geoType: String?
        get() {
            return when (type) {
                "free" -> "polygon"
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
            try {
                var coordsPos = wkt.indexOf("(")
                var coords = wkt.substring(coordsPos).trim()
                coords = coords.replace("\n", " ")
                coords = coords.replace("\\(".toRegex(), "[").replace("\\)".toRegex(), "]")
                coords = coords.replace("\\[(\\s*[-0-9][^\\]]*\\,[^\\]]*[0-9]\\s*)\\]".toRegex(), "[[$1]]")
                coords = coords.replace("([0-9])\\s*\\,\\s*([-0-9])".toRegex(), "$1], [$2")
                coords = coords.replace("([0-9])\\s+([-0-9])".toRegex(), "$1, $2")

                return coords
            } catch (ex: Exception) {
                log.error(ex)
            }
        }

        return null
    }

    fun getWktCoordinatesISO(): String? =
        if (this.wkt != null)
            convertWktToGml32(this.wkt)
        else null


    private fun getWktType(): String? {
        if (this.wkt != null) {
            try {
                var coordsPos = wkt.indexOf("(")
                var wktType = wkt.substring(0, coordsPos).trim().lowercase()

                return wktType
            } catch (ex: Exception) {
                log.error(ex)
            }
        }

        return null
    }
}
