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
package de.ingrid.igeserver.exports.ingrid

import de.ingrid.igeserver.exports.GENERATED_UUID_REGEX
import de.ingrid.igeserver.schema.SchemaUtils
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.kotest.matchers.string.shouldNotContain

open class Geodataset : GeodatasetBase() {

    init {

        /*
         * export with only required inputs.
         * address has no organization assigned.
         * */
        this.should("minimalExport") {
            val result = exportJsonToXML(this@Geodataset.exporter, "/export/ingrid/geo-dataset.minimal.sample.json")
                .replace(GENERATED_UUID_REGEX, "ID_00000000-0000-0000-0000-000000000000")

            result shouldNotBe null
            result shouldBe SchemaUtils.getJsonFileContent("/export/ingrid/geo-dataset.minimal.expected.idf.xml")
            result shouldNotContain "<gmd:distributionInfo>"
        }

        /*
         * export with all inputs possible.
         * address has an organization assigned.
         * */
        this.should("maximalExport") {

            var result = exportJsonToXML(this@Geodataset.exporter, "/export/ingrid/geo-dataset.maximal.sample.json")
            // replace generated UUIDs
            result = result
                .replace(GENERATED_UUID_REGEX, "ID_00000000-0000-0000-0000-000000000000")

            result shouldNotBe null
            result shouldBe SchemaUtils.getJsonFileContent("/export/ingrid/geo-dataset.maximal.expected.idf.xml")
        }

        /*
         * export with only required inputs and openData selected.
         * address has an organization assigned.
         * */
        this.should("openDataMinimalExport") {
            val result = exportJsonToXML(this@Geodataset.exporter, "/export/ingrid/geo-dataset.openData.json")
            result shouldNotBe null
            result shouldBe SchemaUtils.getJsonFileContent("/export/ingrid/geo-dataset.openData.expected.idf.xml")
        }

        /*
         * export with only required inputs and INSPIRE selected.
         * address has an organization assigned.
         * */
        this.should("inspireMinimalExport") {
            val result = exportJsonToXML(this@Geodataset.exporter, "/export/ingrid/geo-dataset.INSPIRE.json")
            result shouldNotBe null
            result shouldBe SchemaUtils.getJsonFileContent("/export/ingrid/geo-dataset.INSPIRE.expected.idf.xml")
        }

        /*
         * export with only required inputs and AdV selected.
         * address has an organization assigned.
         * */
        this.should("advMinimalExport") {
            val result = exportJsonToXML(this@Geodataset.exporter, "/export/ingrid/geo-dataset.AdV.json")
            result shouldNotBe null
            result shouldBe SchemaUtils.getJsonFileContent("/export/ingrid/geo-dataset.AdV.expected.idf.xml")
        }

        /*
         * export with only required inputs and Vektor selected in Digitale Repräsentation.
         * address has an organization assigned.
         * */
        this.should("vectorMinimalExport") {
            val result = exportJsonToXML(this@Geodataset.exporter, "/export/ingrid/geo-dataset.vector.json")
            result shouldNotBe null
            result shouldBe SchemaUtils.getJsonFileContent("/export/ingrid/geo-dataset.vector.expected.idf.xml")
        }

        /*
         * export with only required inputs and Geobasis Raster selected in Digitale Repräsentation.
         * address has an organization assigned.
         * */
        this.should("raster1MinimalExport") {
            val result = exportJsonToXML(this@Geodataset.exporter, "/export/ingrid/geo-dataset.GeobasisRaster.json")
            result shouldNotBe null
            result shouldBe SchemaUtils.getJsonFileContent("/export/ingrid/geo-dataset.GeobasisRaster.expected.idf.xml")
        }

        /*
         * export with only required inputs and Georektifiziertes Raster selected in Digitale Repräsentation.
         * address has an organization assigned.
         * */
        this.should("raster2MinimalExport") {
            val result =
                exportJsonToXML(this@Geodataset.exporter, "/export/ingrid/geo-dataset.GeorektifiziertesRaster.json")
            result shouldNotBe null
            result shouldBe SchemaUtils.getJsonFileContent("/export/ingrid/geo-dataset.GeorektifiziertesRaster.expected.idf.xml")
        }

        /*
         * export with only required inputs and Georeferenzierbares Raster selected in Digitale Repräsentation.
         * address has an organization assigned.
         * */
        this.should("raster3MinimalExport") {
            val result =
                exportJsonToXML(this@Geodataset.exporter, "/export/ingrid/geo-dataset.GeoreferenzierbaresRaster.json")
            result shouldNotBe null
            result shouldBe SchemaUtils.getJsonFileContent("/export/ingrid/geo-dataset.GeoreferenzierbaresRaster.expected.idf.xml")
        }

        /*should("completeExport") {
            var result = exportJsonToXML(exporter, "/export/ingrid/geodataset-Document2.json")
            // replace generated UUIDs
            result = result
                .replace(GENERATED_UUID_REGEX, "ID_00000000-0000-0000-0000-000000000000")

            result shouldNotBe null
            // result shouldBe SchemaUtils.getJsonFileContent("/export/ingrid/geodataset-Document2.idf.xml")
            // TODO: pending testdata adjustment or remove?
        }*/

        this.xshould("completeLuceneExport") {
            var result = exportJsonToJson(this@Geodataset.indexExporter, "/export/ingrid/geodataset-Document2.json")
            // replace generated UUIDs
            result = result
                .replace(GENERATED_UUID_REGEX, "ID_00000000-0000-0000-0000-000000000000")

            result shouldNotBe null
            // TODO: pending
            // result shouldBe SchemaUtils.getJsonFileContent("/export/ingrid/geodataset-Document2.lucene.json")
        }
    }
}
