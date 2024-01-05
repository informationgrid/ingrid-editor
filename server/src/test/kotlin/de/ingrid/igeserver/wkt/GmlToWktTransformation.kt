/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.wkt

import de.ingrid.igeserver.utils.convertGml32ToWkt
import io.kotest.core.spec.style.ShouldSpec
import io.kotest.matchers.shouldBe

class GmlToWktTransformation : ShouldSpec({

    should("convert Point GML 3.2 to WKT") {
        val input =
            """<gml:Point xmlns:gml="http://www.opengis.net/gml/3.2" gml:id="Point_ID_7d8bfe21-328a-400e-b38d-549f2cc7cef8" srsDimension="2"><gml:pos>40 10</gml:pos></gml:Point>"""
        val result = convertGml32ToWkt(input)
        result shouldBe "POINT (40 10)"
    }

    should("convert LineString GML 3.2 to WKT") {
        val input =
            """<gml:LineString xmlns:gml="http://www.opengis.net/gml/3.2" gml:id="LineString_ID_7412ae7c-30d6-4d7f-8939-a89f9d480907" srsDimension="2"><gml:posList>10 10 20 20 10 40</gml:posList></gml:LineString>"""
        val result = convertGml32ToWkt(input)
        result shouldBe "LINESTRING (10 10, 20 20, 10 40)"
    }

    should("convert Polygon GML 3.2 to WKT") {
        val input =
            """<Polygon xmlns:gml="http://www.opengis.net/gml/3.2" gml:id="Polygon_ID_12345" srsDimension="2"><exterior><LinearRing><posList>1 2 1 4 3 4 3 2 1 2</posList></LinearRing></exterior></Polygon>"""
        val result = convertGml32ToWkt(input)
        result shouldBe "POLYGON ((1 2, 1 4, 3 4, 3 2, 1 2))"
    }

    should("convert MultiPoint GML 3.2 to WKT") {
        val input =
            """<gml:MultiPoint xmlns:gml="http://www.opengis.net/gml" gml:id="MultiPoint_ID_51fa7104-d537-4c8f-8994-cfd582202487" srsDimension="2"><gml:pointMember><gml:Point gml:id="Point_ID_f0c29a56-1b9f-42ce-906c-b80a528b7841" srsDimension="2"><gml:pos>10.0 40.0</gml:pos></gml:Point></gml:pointMember><gml:pointMember><gml:Point gml:id="Point_ID_b526e421-dce0-4352-a0e1-d25fcf6f84cb" srsDimension="2"><gml:pos>40.0 30.0</gml:pos></gml:Point></gml:pointMember><gml:pointMember><gml:Point gml:id="Point_ID_41373d68-b40a-4949-87ea-69cc27b8ce8e" srsDimension="2"><gml:pos>20.0 20.0</gml:pos></gml:Point></gml:pointMember><gml:pointMember><gml:Point gml:id="Point_ID_380b72df-90ce-43cc-91b3-8250152e7cec" srsDimension="2"><gml:pos>30.0 10.0</gml:pos></gml:Point></gml:pointMember></gml:MultiPoint>"""
        val result = convertGml32ToWkt(input)
        result shouldBe "MULTIPOINT ((10 40), (40 30), (20 20), (30 10))"
    }

    should("convert MultiCurve GML 3.2 to WKT") {
        val input =
            """<gml:MultiCurve xmlns:gml="http://www.opengis.net/gml/3.2" gml:id="MultiCurve_ID_22cd67d7-e93a-46d9-ac3a-b70fb9c8cef5" srsDimension="2"><gml:curveMember><gml:LineString gml:id="LineString_ID_d74fdf2c-d39d-4e34-b9b7-8a0bf8d61a99" srsDimension="2"><gml:posList>10.0 10.0 20.0 20.0 10.0 40.0</gml:posList></gml:LineString></gml:curveMember><gml:curveMember><gml:LineString gml:id="LineString_ID_a703de7d-a8af-4517-86f1-862cd76e97b1" srsDimension="2"><gml:posList>40.0 40.0 30.0 30.0 40.0 20.0 30.0 10.0</gml:posList></gml:LineString></gml:curveMember></gml:MultiCurve>"""
        val result = convertGml32ToWkt(input)
        result shouldBe "MULTILINESTRING ((10 10, 20 20, 10 40), (40 40, 30 30, 40 20, 30 10))"
    }

    should("convert MultiSurface GML 3.2 to WKT") {
        val input =
            """<gml:MultiSurface xmlns:gml="http://www.opengis.net/gml/3.2" gml:id="MultiSurface_ID_5384207c-44f7-4ba8-9af4-7cb5514fcbfb" srsDimension="2"><gml:surfaceMember><gml:Polygon gml:id="Polygon_ID_95000c23-8e48-429a-ba7f-86baa6925b2e" srsDimension="2"><gml:exterior><gml:LinearRing><gml:posList>40.0 40.0 20.0 45.0 45.0 30.0 40.0 40.0</gml:posList></gml:LinearRing></gml:exterior></gml:Polygon></gml:surfaceMember><gml:surfaceMember><gml:Polygon gml:id="Polygon_ID_b2a228fb-4cba-4edb-a223-a408d9366302" srsDimension="2"><gml:exterior><gml:LinearRing><gml:posList>20.0 35.0 10.0 30.0 10.0 10.0 30.0 5.0 45.0 20.0 20.0 35.0</gml:posList></gml:LinearRing></gml:exterior><gml:interior><gml:LinearRing><gml:posList>30.0 20.0 20.0 15.0 20.0 25.0 30.0 20.0</gml:posList></gml:LinearRing></gml:interior></gml:Polygon></gml:surfaceMember></gml:MultiSurface>"""
        val result = convertGml32ToWkt(input)
        result shouldBe "MULTIPOLYGON (((40 40, 20 45, 45 30, 40 40)), ((20 35, 10 30, 10 10, 30 5, 45 20, 20 35), (30 20, 20 15, 20 25, 30 20)))"
    }

    should("convert MultiGeometry GML 3.2 to WKT") {
        val input =
            """<gml:MultiGeometry xmlns:gml="http://www.opengis.net/gml/3.2" gml:id="MultiGeometry_ID_e086c17f-e2e1-46d5-a9c8-4a8ac14fbf83" srsDimension="2"><gml:geometryMember><gml:Point gml:id="Point_ID_7d8bfe21-328a-400e-b38d-549f2cc7cef8" srsDimension="2"><gml:pos>40 10</gml:pos></gml:Point></gml:geometryMember><gml:geometryMember><gml:LineString gml:id="LineString_ID_7412ae7c-30d6-4d7f-8939-a89f9d480907" srsDimension="2"><gml:posList>10 10 20 20 10 40</gml:posList></gml:LineString></gml:geometryMember><gml:geometryMember><gml:Polygon gml:id="Polygon_ID_7c816d63-ccd7-4863-b3b1-a5ef7cd5ab0f" srsDimension="2"><gml:exterior><gml:LinearRing><gml:posList>40 40 20 45 45 30 40 40</gml:posList></gml:LinearRing></gml:exterior></gml:Polygon></gml:geometryMember></gml:MultiGeometry>"""
        val result = convertGml32ToWkt(input)
        result shouldBe "GEOMETRYCOLLECTION (POINT (40 10), LINESTRING (10 10, 20 20, 10 40), POLYGON ((40 40, 20 45, 45 30, 40 40)))"
    }
})