/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver.utils

import org.geotools.geojson.geom.GeometryJSON
import org.geotools.geometry.jts.WKTReader2
import org.geotools.gml3.v3_2.GML
import org.geotools.gml3.v3_2.GMLConfiguration
import org.geotools.xsd.Encoder
import org.geotools.xsd.Parser
import org.locationtech.jts.algorithm.Orientation
import org.locationtech.jts.geom.*
import java.io.ByteArrayOutputStream
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

fun convertWktToGeoJson(wkt: String): String {
    val reader = WKTReader2()
    var geometry = reader.read(wkt)
    if (geometry.isValid) {
        geometry = checkOrientation(geometry)
    }
    val geometryJSON = GeometryJSON(10)
    val out = ByteArrayOutputStream()
    geometryJSON.write(geometry, out)
    return out.toString()
}

private fun checkOrientation(geom: Geometry): Geometry {
    var tmpGeom = geom
    when (tmpGeom.geometryType) {
        Polygon.TYPENAME_POLYGON -> if (tmpGeom.isValid) {
            if (Orientation.isCCW(tmpGeom.coordinates)) {
                tmpGeom = tmpGeom.reverse()
            }
        }

        else -> {}
    }
    return tmpGeom
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
