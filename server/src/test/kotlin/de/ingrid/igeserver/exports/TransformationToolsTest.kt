package de.ingrid.igeserver.exports

import de.ingrid.igeserver.exporter.TransformationTools
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe

class TransformationToolsTest : AnnotationSpec() {

    val GENERATED_UUID_REGEX = Regex("ID_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}")


    @Test
    fun wktToGmlTest() {
        val wkt = "Point(10 10)"
        val gml = """
            <gml:Point gml:id="Point_ID_00000000-0000-0000-0000-000000000000" srsDimension="2">
                <gml:pos>10 10</gml:pos>
            </gml:Point>
        """.trimIndent()

        var result = TransformationTools.wktToGml(wkt)
        result = result
            .replace(GENERATED_UUID_REGEX, "ID_00000000-0000-0000-0000-000000000000")

        result shouldNotBe null
        result shouldBe gml
    }

    @Test
    fun wktToGmlTest2() {
        val wkt = "GEOMETRYCOLLECTION(POINT(10 10), LINESTRING(10 10, 20 20, 10 40), POLYGON((0 0, 0 10, 10 10, 10 0, 0 0)))"
        val gml = """
                <gml:MultiGeometry gml:id="MultiGeometry_ID_00000000-0000-0000-0000-000000000000" srsDimension="2">
                  <gml:geometryMember>
                    <gml:Point gml:id="Point_ID_00000000-0000-0000-0000-000000000000" srsDimension="2">
                      <gml:pos>10 10</gml:pos>
                    </gml:Point>
                  </gml:geometryMember>
                  <gml:geometryMember>
                    <gml:LineString gml:id="LineString_ID_00000000-0000-0000-0000-000000000000" srsDimension="2">
                      <gml:posList>10 10 20 20 10 40</gml:posList>
                    </gml:LineString>
                  </gml:geometryMember>
                  <gml:geometryMember>
                    <gml:Polygon gml:id="Polygon_ID_00000000-0000-0000-0000-000000000000" srsDimension="2">
                      <gml:exterior>
                        <gml:LinearRing>
                          <gml:posList>0 0 0 10 10 10 10 0 0 0</gml:posList>
                        </gml:LinearRing>
                      </gml:exterior>
                    </gml:Polygon>
                  </gml:geometryMember>
                </gml:MultiGeometry>
        """.trimIndent()

        var result = TransformationTools.wktToGml(wkt)
        result = result
            .replace(GENERATED_UUID_REGEX, "ID_00000000-0000-0000-0000-000000000000")

        result shouldNotBe null
        result shouldBe gml
    }
}
