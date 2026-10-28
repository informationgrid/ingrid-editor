/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIDFExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIndexExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridLuceneExporter
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.BehaviourService
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.utils.SpringContext
import de.ingrid.mdek.upload.UploadConfig
import initDocumentMocks
import io.kotest.core.spec.Spec
import io.kotest.core.spec.style.ShouldSpec
import io.kotest.matchers.shouldNotBe
import io.kotest.matchers.string.shouldContain
import io.kotest.matchers.string.shouldNotContain
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import mockBehaviours
import mockCatalog
import mockCodelists
import tools.jackson.databind.node.ObjectNode
import tools.jackson.module.kotlin.jacksonObjectMapper

class Algorithm : ShouldSpec() {

    private val documentService = mockk<DocumentService>()
    private val behaviourService = mockk<BehaviourService>()

    // this bean must be mocked, although it might not be used in this class
    private val catalogService = mockk<CatalogService>()
    private val documentWrapperRepository = mockk<DocumentWrapperRepository>(relaxed = true)
    private val codelistHandler = mockk<CodelistHandler>()
    private val uploadConfig = mockk<UploadConfig>()

    private lateinit var exporter: IngridIDFExporter
    private lateinit var luceneExporter: IngridLuceneExporter
    private lateinit var indexExporter: IngridIndexExporter

    override suspend fun beforeSpec(spec: Spec) {
        clearAllMocks()
        this.exporter = IngridIDFExporter(this.codelistHandler, this.uploadConfig, this.catalogService, this.documentService, this.documentWrapperRepository)
        this.luceneExporter = IngridLuceneExporter(this.codelistHandler, this.uploadConfig, this.catalogService, this.documentService)
        this.indexExporter = IngridIndexExporter(this.exporter, this.luceneExporter)

        mockkObject(SpringContext)
        every { SpringContext.getBean(DocumentService::class.java) } answers {
            documentService
        }
        every { SpringContext.getBean(BehaviourService::class.java) } answers {
            behaviourService
        }
        every { SpringContext.getBean(DocumentWrapperRepository::class.java) } answers {
            documentWrapperRepository
        }

        every { codelistHandler.getCatalogCodelistValue(this.any(), this.any(), this.any()) } answers {
            val codelistId = this.secondArg<String>()
            val entryId = this.thirdArg<String>()
            when (codelistId + "_" + entryId) {
                "111_1" -> "Provider 1"
                "111_2" -> "Provider 2"
                "6250_7" -> "Hessen"
                else -> codelistId + "_" + entryId
            }
        }

        mockCatalog(this.catalogService)
        mockCodelists(this.codelistHandler)
        mockBehaviours(this.behaviourService, "plugin.ingrid.doi")

        val addresses = listOf(
            MockDocument(
                1638,
                "25d56d6c-ed8d-4589-8c14-f8cfcb669115",
                "/export/ingrid/address.organisation.sample.json",
                type = "InGridOrganisationDoc",
            ),
            MockDocument(
                1634,
                "14a37ded-4ca5-4677-bfed-3607bed3071d",
                "/export/ingrid/address.person.sample.json",
                1638,
            ),
            MockDocument(
                1652,
                "fc521f66-0f47-45fb-ae42-b14fc669942e",
                "/export/ingrid/address.person2.sample.json",
                1638,
            ),
        )

        val datasets = listOf(
            MockDocument(
                uuid = "a910fde0-3910-413e-9c14-4fa86f3d12c2",
                template = "/export/ingrid/geo-dataset.maximal.sample.json",
            ),
            MockDocument(uuid = "93CD0919-5A2F-4286-B731-645C34614AA1"),
        )

        every { documentService.getParentWrapper(any()) } returns null
        every { documentService.getIncomingReferenceUUIDs(any(), any(), any()) } answers { emptySet() }

        initDocumentMocks(addresses + datasets, this.documentService)
    }

    init {
        should("export algorithm metadata") {
            val context = jacksonObjectMapper().readTree(
                """{
                    "trainingData": "some training data",
                    "dataBias": "some data bias",
                    "inputData": [{
                      "name": "input dataset",
                      "url": "https://example.org/input",
                      "attributes": [{
                        "name": "some attribute",
                        "unit": "m",
                        "spatialResolution": "10 m",
                        "temporalResolution": "1 day"
                      }]
                    }],
                    "outputData": [{
                      "name": "output dataset",
                      "url": null
                    }],
                    "algorithmType": "rule-based",
                    "explanation": "some explanation",
                    "methods": ["regression"],
                    "errorBias": "some error bias",
                    "monitoring": "some monitoring",
                    "typeOfUse": "predictive",
                    "apiUrl": "https://example.org/api",
                    "sourceCodeUrl": "https://github.com/example",
                    "websiteUrl": "https://example.org",
                    "exampleUrl": null,
                    "publiccodeUrl": null,
                    "additionalUrls": [{
                      "name": "docs",
                      "url": "https://example.org/docs"
                    }]
                }
                """.trimIndent(),
            ) as ObjectNode

            val result = exportJsonToXML(
                exporter,
                "/export/ingrid/algorithm.minimal.sample.json",
                context,
            )

            result shouldContain ALGORITHM_METADATA_OPEN
            result shouldContain "<gco:CharacterString>some training data</gco:CharacterString>"
            result shouldContain "<gco:CharacterString>some data bias</gco:CharacterString>"
            result shouldContain "<gco:CharacterString>input dataset</gco:CharacterString>"
            result shouldContain "<gco:CharacterString>some attribute</gco:CharacterString>"
            result shouldContain "<gco:CharacterString>10 m</gco:CharacterString>"
            result shouldContain "<gco:CharacterString>1 day</gco:CharacterString>"
            result shouldContain "<gco:CharacterString>output dataset</gco:CharacterString>"
            result shouldContain "<gco:CharacterString>rule-based</gco:CharacterString>"
            result shouldContain "<gco:CharacterString>some explanation</gco:CharacterString>"
            result shouldContain "<gco:CharacterString>regression</gco:CharacterString>"
            result shouldContain "<gco:CharacterString>some error bias</gco:CharacterString>"
            result shouldContain "<gco:CharacterString>some monitoring</gco:CharacterString>"
            result shouldContain "<gco:CharacterString>predictive</gco:CharacterString>"
            result shouldContain "<gco:CharacterString>https://example.org/api</gco:CharacterString>"
            result shouldContain "<gco:CharacterString>https://github.com/example</gco:CharacterString>"
            result shouldContain "<gco:CharacterString>https://example.org</gco:CharacterString>"
            result shouldContain "<gco:CharacterString>docs</gco:CharacterString>"
            result shouldContain "<gco:CharacterString>https://example.org/docs</gco:CharacterString>"
            result shouldContain "</alg:Algorithm_Metadata>"
        }

        should("not export algorithm metadata when no algorithm specific field has a value") {
            val result = exportJsonToXML(exporter, "/export/ingrid/algorithm.minimal.sample.json")
            result shouldNotContain ALGORITHM_METADATA_OPEN
        }

        should("completeLuceneExport") {
            val result = exportJsonToJson(indexExporter, "/export/ingrid/algorithm.minimal.sample.json")
            result shouldNotBe null
            result shouldContain """"t01_object.obj_class" : "7""""
        }
    }

    companion object {
        private const val ALGORITHM_METADATA_OPEN =
            "<alg:Algorithm_Metadata xmlns:alg=\"https://www.ingrid-oss.eu/schemas/algorithmmd\">"
    }
}
