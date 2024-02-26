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

import MockDocument
import de.ingrid.igeserver.exports.GENERATED_UUID_REGEX
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIDFExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIndexExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridLuceneExporter
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.schema.SchemaUtils
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.utils.SpringContext
import de.ingrid.mdek.upload.Config
import initDocumentMocks
import io.kotest.core.spec.Spec
import io.kotest.core.spec.style.ShouldSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import mockCatalog
import mockCodelists

open class Geodataset : ShouldSpec() {

    protected val documentService = mockk<DocumentService>()

    // this bean must be mocked, although it might not be used in this class
    protected val catalogService = mockk<CatalogService>()

    protected val codelistHandler = mockk<CodelistHandler>()
    private val documentWrapperRepository = mockk<DocumentWrapperRepository>(relaxed = true)
    protected val config = mockk<Config>()

    protected lateinit var exporter: IngridIDFExporter
    private lateinit var indexExporter: IngridIndexExporter
    private lateinit var luceneExporter: IngridLuceneExporter

    override suspend fun beforeSpec(spec: Spec) {
        clearAllMocks()
        this.exporter = IngridIDFExporter(this.codelistHandler, this.config, this.catalogService, this.documentService)
        this.luceneExporter = IngridLuceneExporter(
            this.codelistHandler,
            this.config,
            this.catalogService,
            this.documentService
        )
        this.indexExporter = IngridIndexExporter(this.exporter, this.luceneExporter, this.documentWrapperRepository)

        mockkObject(SpringContext.Companion)
        every { SpringContext.getBean(DocumentService::class.java) } answers {
            this@Geodataset.documentService
        }

        every { this@Geodataset.codelistHandler.getCatalogCodelistValue(this.any(), this.any(), this.any()) } answers {
            val codelistId = this.secondArg<String>()
            val entryId = this.thirdArg<String>()
            when (codelistId + "_" + entryId) {
                "1350_1" -> "Baugesetzbuch (BauGB)"
                "1350_2" -> "Atomgesetz (AtG)"
                "1350_13" -> "Kreislaufwirtschafts- u. Abfallgesetz (KrW-/AbfG)"
                "1350_26" -> "Umweltstatistikgesetz (Fass. 21.06.1994)"
                "111_1" -> "Provider 1"
                "111_2" -> "Provider 2"
                "6250_7" -> "Hessen"
                else -> codelistId + "_" + entryId
            }
        }

        mockCatalog(this.catalogService)
        mockCodelists(this.codelistHandler)

        val addresses = listOf(
            MockDocument(
                1638,
                "25d56d6c-ed8d-4589-8c14-f8cfcb669115",
                "/export/ingrid/address.organisation.sample.json",
                type = "InGridOrganisationDoc"
            ),
            MockDocument(
                1634,
                "14a37ded-4ca5-4677-bfed-3607bed3071d",
                "/export/ingrid/address.person.sample.json",
                1638
            ),
            MockDocument(
                1652,
                "fc521f66-0f47-45fb-ae42-b14fc669942e",
                "/export/ingrid/address.person2.sample.json",
                1638
            )
        )

        val datasets = listOf(
            MockDocument(
                uuid = "a910fde0-3910-413e-9c14-4fa86f3d12c2",
                template = "/export/ingrid/geo-dataset.maximal.sample.json"
            ),
            MockDocument(uuid = "93CD0919-5A2F-4286-B731-645C34614AA1")
        )

        initDocumentMocks(addresses + datasets, this.documentService)
        every { this@Geodataset.documentService.getIncomingReferences(this.any(), this.any()) } answers { emptySet() }
    }

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
            val result = exportJsonToXML(this@Geodataset.exporter, "/export/ingrid/geo-dataset.GeorektifiziertesRaster.json")
            result shouldNotBe null
            result shouldBe SchemaUtils.getJsonFileContent("/export/ingrid/geo-dataset.GeorektifiziertesRaster.expected.idf.xml")
        }

        /*
        * export with only required inputs and Georeferenzierbares Raster selected in Digitale Repräsentation.
        * address has an organization assigned.
        * */
        this.should("raster3MinimalExport") {
            val result = exportJsonToXML(this@Geodataset.exporter, "/export/ingrid/geo-dataset.GeoreferenzierbaresRaster.json")
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
