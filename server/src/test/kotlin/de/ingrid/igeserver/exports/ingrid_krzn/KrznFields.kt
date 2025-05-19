/**
 * ==================================================
 * Copyright (C) 2025 wemove digital solutions GmbH
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
                <idf:mapUrl>https://www.my-map-link.com/maps?mid=7abc5862-a893-4a70-8d83-23cf5a2dd264&amp;MAPS={%22zoom%22:9}</idf:mapUrl>
            """.trimIndent()
        }

        should("export map link with center parameter") {
            val context = jacksonObjectMapper()
                .readTree("""{ "mapLink": { "key": 1 }, "mapCenter": "11111,22222" }""") as ObjectNode

            val result = exportJsonToXML(exporter, docSample, context)
            result shouldContain """
                <idf:mapUrl>https://www.my-map-link.com/maps?mid=7abc5862-a893-4a70-8d83-23cf5a2dd264&amp;MAPS={%22center%22:[11111,22222]}</idf:mapUrl>
            """.trimIndent()
        }

        should("export map link with zoom and center parameter") {
            val context = jacksonObjectMapper()
                .readTree("""{ "mapLink": { "key": 1 }, "mapZoomLevel": 9, "mapCenter": "11111,22222" }""") as ObjectNode

            val result = exportJsonToXML(exporter, docSample, context)
            result shouldContain """
                <idf:mapUrl>https://www.my-map-link.com/maps?mid=7abc5862-a893-4a70-8d83-23cf5a2dd264&amp;MAPS={%22center%22:[11111,22222],%22zoom%22:9}</idf:mapUrl>
            """.trimIndent()
        }
    }
}
