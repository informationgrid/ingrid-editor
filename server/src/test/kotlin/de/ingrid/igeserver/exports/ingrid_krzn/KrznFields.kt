package de.ingrid.igeserver.exports.ingrid_krzn

import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.DummyCatalog
import de.ingrid.igeserver.exports.ingrid.GeodatasetBase
import de.ingrid.igeserver.exports.ingrid.exportJsonToXML
import de.ingrid.igeserver.profiles.ingrid_krzn.exporter.IngridIdfExporterKrzn
import io.kotest.core.spec.Spec
import io.kotest.matchers.string.shouldContain
import io.mockk.every

class KrznFields : GeodatasetBase() {

    private val docSample = "/export/ingrid/geo-dataset.minimal.sample.json"

    override suspend fun beforeSpec(spec: Spec) {
        super.beforeSpec(spec)
        this.exporter =
            IngridIdfExporterKrzn(
                this.codelistHandler,
                this.uploadConfig,
                this.catalogService,
                this.documentService,
            )
        every { catalogService.getProfileFromCatalog(any()) } returns
            DummyCatalog("ingrid-krzn")

        every { codelistHandler.getCatalogCodelistValue(any(), "10500", "1") } returns "https://www.my-map-link.com/maps?mid={ID}"
    }

    init {
        should("export map link without parameters") {
            val context = jacksonObjectMapper()
                .readTree("""{ "mapLink": { "key": 1 } }""") as ObjectNode

            val result = exportJsonToXML(exporter, docSample, context)
            result shouldContain """
                <idf:mapUrl>https://www.my-map-link.com/maps?mid=7abc5862-a893-4a70-8d83-23cf5a2dd264</idf:mapUrl>
            """.trimIndent()
        }

        should("export map link with zoom parameter") {
            val context = jacksonObjectMapper()
                .readTree("""{ "mapLink": { "key": 1 }, "mapZoomLevel": 9 }""") as ObjectNode

            val result = exportJsonToXML(exporter, docSample, context)
            result shouldContain """
                <idf:mapUrl>https://www.my-map-link.com/maps?mid=7abc5862-a893-4a70-8d83-23cf5a2dd264&amp;MAPS={%22zoom%22: 9}</idf:mapUrl>
            """.trimIndent()
        }

        should("export map link with center parameter") {
            val context = jacksonObjectMapper()
                .readTree("""{ "mapLink": { "key": 1 }, "mapCenter": "11111,22222" }""") as ObjectNode

            val result = exportJsonToXML(exporter, docSample, context)
            result shouldContain """
                <idf:mapUrl>https://www.my-map-link.com/maps?mid=7abc5862-a893-4a70-8d83-23cf5a2dd264&amp;MAPS={%22center%22: [11111, 22222]}</idf:mapUrl>
            """.trimIndent()
        }

        should("export map link with zoom and center parameter") {
            val context = jacksonObjectMapper()
                .readTree("""{ "mapLink": { "key": 1 }, "mapZoomLevel": 9, "mapCenter": "11111,22222" }""") as ObjectNode

            val result = exportJsonToXML(exporter, docSample, context)
            result shouldContain """
                <idf:mapUrl>https://www.my-map-link.com/maps?mid=7abc5862-a893-4a70-8d83-23cf5a2dd264&amp;MAPS={%22center%22: [11111, 22222], %22zoom%22: 9}</idf:mapUrl>
            """.trimIndent()
        }
    }
}
