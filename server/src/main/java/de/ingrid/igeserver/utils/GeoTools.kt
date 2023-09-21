package de.ingrid.igeserver.utils

import org.geotools.geometry.jts.WKTReader2
import org.geotools.gml3.v3_2.GML
import org.geotools.gml3.v3_2.GMLConfiguration
import org.geotools.xsd.Encoder
import org.geotools.xsd.Parser
import org.locationtech.jts.geom.*
import java.nio.charset.StandardCharsets
import java.util.*
import javax.xml.namespace.QName

fun convertWktToGml32(wkt: String): String {
    val reader = WKTReader2()
    val geometry = reader.read(wkt)

    val qName: QName? = determineType(geometry)

    val config = GMLConfiguration()
    val encoder = Encoder(config)
    encoder.isOmitXMLDeclaration = true

    return encoder.encodeAsString(geometry, qName)
        .run {
            // remove all attributes from root element
            val str = substring(indexOf(' '), indexOf('>'))
            replace(str, "")
        }
        // add gml:id attribute to root element
        .replace(
            Regex("<gml:(Point|MultiPoint|LineString|MultiLineString|Polygon|MultiPolygon|MultiGeometry)\\b"),
            """<gml:$1 gml:id="$1_ID_${UUID.randomUUID()}""""
        )
}

fun convertGml32ToWkt(input: String?): String? {
    return if (!input.isNullOrEmpty()) {
        val config = GMLConfiguration()
        val parser = Parser(config)
        val wktObj = parser.parse(input.byteInputStream(StandardCharsets.UTF_8))
        wktObj.toString()
    } else null
}

private fun determineType(geometry: Geometry): QName? {
    return when (geometry) {
        is Point -> GML.Point
        is MultiPoint -> GML.MultiPoint
        is LineString -> GML.LineString
        is MultiLineString -> GML.MultiCurve
        is Polygon -> GML.Polygon
        is MultiPolygon -> GML.MultiSurface
        is GeometryCollection -> GML.MultiGeometry
        else -> throw IllegalArgumentException("Geometry type is currently not supported: " + geometry.geometryType)

    }
}
