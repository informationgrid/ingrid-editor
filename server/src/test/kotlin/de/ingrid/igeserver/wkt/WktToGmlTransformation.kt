package de.ingrid.igeserver.wkt

import de.ingrid.igeserver.utils.convertWktToGml32
import io.kotest.core.spec.style.ShouldSpec
import io.kotest.matchers.shouldBe

class WktToGmlTransformation : ShouldSpec({

    should("convert Point WKT to GML 3.2") {
        val wkt = "POINT(30 10)"
        val result = deleteIdAttributes(convertWktToGml32(wkt))
        result shouldBe "<gml:Point><gml:pos>30 10</gml:pos></gml:Point>"
    }

    should("convert MultiPoint WKT to GML 3.2") {
        val wkt = "MULTIPOINT ((10 40), (40 30), (20 20), (30 10))"
        val result = deleteIdAttributes(convertWktToGml32(wkt))
        result shouldBe "<gml:MultiPoint><gml:pointMember><gml:Point srsDimension=\"2\"><gml:pos>10 40</gml:pos></gml:Point></gml:pointMember><gml:pointMember><gml:Point srsDimension=\"2\"><gml:pos>40 30</gml:pos></gml:Point></gml:pointMember><gml:pointMember><gml:Point srsDimension=\"2\"><gml:pos>20 20</gml:pos></gml:Point></gml:pointMember><gml:pointMember><gml:Point srsDimension=\"2\"><gml:pos>30 10</gml:pos></gml:Point></gml:pointMember></gml:MultiPoint>"
    }

    should("convert LineString WKT to GML 3.2") {
        val wkt = "LINESTRING (30 10, 10 30, 40 40)"
        val result = deleteIdAttributes(convertWktToGml32(wkt))
        result shouldBe "<gml:LineString><gml:posList>30 10 10 30 40 40</gml:posList></gml:LineString>"
    }

    should("convert MultiLineString WKT to GML 3.2") {
        val wkt = "MULTILINESTRING ((10 10, 20 20, 10 40), (40 40, 30 30, 40 20, 30 10))"
        val result = deleteIdAttributes(convertWktToGml32(wkt))
        result shouldBe "<gml:MultiCurve><gml:curveMember><gml:LineString srsDimension=\"2\"><gml:posList>10 10 20 20 10 40</gml:posList></gml:LineString></gml:curveMember><gml:curveMember><gml:LineString srsDimension=\"2\"><gml:posList>40 40 30 30 40 20 30 10</gml:posList></gml:LineString></gml:curveMember></gml:MultiCurve>"

    }

    should("convert Polygon WKT to GML 3.2") {
        val wkt = "POLYGON((1 2,1 4,3 4,3 2,1 2))"
        val result = deleteIdAttributes(convertWktToGml32(wkt))

        result shouldBe """
            <gml:Polygon><gml:exterior><gml:LinearRing><gml:posList>1 2 1 4 3 4 3 2 1 2</gml:posList></gml:LinearRing></gml:exterior></gml:Polygon>
        """.trimIndent()
    }

    should("convert MultiPolygon WKT to GML 3.2") {
        val wkt =
            "MULTIPOLYGON (((40 40, 20 45, 45 30, 40 40)), ((20 35, 10 30, 10 10, 30 5, 45 20, 20 35), (30 20, 20 15, 20 25, 30 20)))"
        val result = deleteIdAttributes(convertWktToGml32(wkt))

        result shouldBe "<gml:MultiSurface><gml:surfaceMember><gml:Polygon srsDimension=\"2\"><gml:exterior><gml:LinearRing><gml:posList>40 40 20 45 45 30 40 40</gml:posList></gml:LinearRing></gml:exterior></gml:Polygon></gml:surfaceMember><gml:surfaceMember><gml:Polygon srsDimension=\"2\"><gml:exterior><gml:LinearRing><gml:posList>20 35 10 30 10 10 30 5 45 20 20 35</gml:posList></gml:LinearRing></gml:exterior><gml:interior><gml:LinearRing><gml:posList>30 20 20 15 20 25 30 20</gml:posList></gml:LinearRing></gml:interior></gml:Polygon></gml:surfaceMember></gml:MultiSurface>"

    }

    should("convert MultiGeometry WKT to GML 3.2") {
        val wkt =
            "GEOMETRYCOLLECTION (POINT (40 10), LINESTRING (10 10, 20 20, 10 40), POLYGON ((40 40, 20 45, 45 30, 40 40)))"
        val result = deleteIdAttributes(convertWktToGml32(wkt))

        result shouldBe "<gml:MultiGeometry><gml:geometryMember><gml:Point srsDimension=\"2\"><gml:pos>40 10</gml:pos></gml:Point></gml:geometryMember><gml:geometryMember><gml:LineString srsDimension=\"2\"><gml:posList>10 10 20 20 10 40</gml:posList></gml:LineString></gml:geometryMember><gml:geometryMember><gml:Polygon srsDimension=\"2\"><gml:exterior><gml:LinearRing><gml:posList>40 40 20 45 45 30 40 40</gml:posList></gml:LinearRing></gml:exterior></gml:Polygon></gml:geometryMember></gml:MultiGeometry>"
    }

})

private fun deleteIdAttributes(gml: String) = gml.replace(Regex(" gml:id=\"[^\"]+\""), "")

