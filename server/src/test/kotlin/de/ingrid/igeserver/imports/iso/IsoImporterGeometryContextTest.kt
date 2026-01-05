/*
 * ==================================================
 * Copyright (C) 2025-2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.imports.iso

import de.ingrid.igeserver.DummyCatalog
import de.ingrid.igeserver.imports.minimalDatasetMetadata
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.ISOImport
import de.ingrid.igeserver.profiles.ingrid_up_sh.importer.ISOImportUPSH
import de.ingrid.igeserver.repository.DocumentRepository
import de.ingrid.igeserver.services.BwastrLocatorService
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.ResearchService
import de.ingrid.igeserver.utils.getString
import de.ingrid.mdek.upload.UploadConfig
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.matchers.nulls.shouldBeNull
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import mockCodelists

class IsoImporterGeometryContextTest : AnnotationSpec() {

    private val codelistService = mockk<CodelistHandler>()
    private val catalogService = mockk<CatalogService>()
    private val documentService = mockk<DocumentService>()
    private val documentRepository = mockk<DocumentRepository>()
    private val researchService = mockk<ResearchService>()
    private val uploadConfig = mockk<UploadConfig>()
    private val bwastrLocatorService = mockk<BwastrLocatorService>()

    @BeforeAll
    fun beforeAll() {
        mockCodelists(codelistService)
        every { catalogService.getProfileFromCatalog(any()) } returns DummyCatalog() // default profile: no special handling
        every { catalogService.getCatalogById(any()) } returns Catalog()
        every { documentService.docRepo } returns documentRepository
        every { documentRepository.findAddressByOrganisationName(any(), any()) } returns emptyList()
        // needed for checking if imported address-reference already exists (default yes)
        every { documentService.getWrapperByCatalogAndDocumentUuid(any(), any()) } returns de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper()
        // Simplify research: return no hits by default
        every { researchService.query(any(), any(), any()) } returns de.ingrid.igeserver.model.ResearchResponse(0, emptyList())
    }

    @Test
    fun geometryContextNotImportedByDefault() {
        val isoImporter = ISOImport(codelistService, catalogService, documentService, researchService, bwastrLocatorService, uploadConfig)

        val xml = minimalDatasetWithGeometryContext()
        val result = isoImporter.run("test", xml, mutableMapOf())

        // geometryContext must NOT be present for default profile/settings
        result[0].get("geometryContext").shouldBeNull()
    }

    @Test
    fun geometryContextImportedForUPSH() {
        val isoImporter = ISOImport(codelistService, catalogService, documentService, researchService, bwastrLocatorService, uploadConfig)
        // Enable profile handler for ingrid-up-sh which activates importGeometryContext
        isoImporter.profileMapper["ingrid-up-sh"] = ISOImportUPSH()
        every { catalogService.getProfileFromCatalog(any()) } returns DummyCatalog("ingrid-up-sh")

        val xml = minimalDatasetWithGeometryContext()
        val result = isoImporter.run("test", xml, mutableMapOf())

        val ctx = result[0].get("geometryContext")
        // Should contain one geometry context element mapped from XML
        ctx.isArray shouldBe true
        ctx.size() shouldBe 1
        val first = ctx[0]

        first.getString("name") shouldBe "test-name"
        first.getString("dataType") shouldBe "test-datatype"
        first.getString("description") shouldBe "test-description"
        first.getString("featureType.key") shouldBe "nominal"
        first.getString("featureType.value") shouldBe "nominal"
        first.getString("geometryType") shouldBe "test-geometryType"
        first.get("min").asDouble() shouldBe 3.0
        first.get("max").asDouble() shouldBe 12.0
        first.getString("unit") shouldBe "test-unit"

        // Attributes mapped as key/value pairs
        val attrs = first.get("attributes")
        attrs.isArray shouldBe true
        attrs.size() shouldBe 2
        attrs[0].getString("key") shouldBe "1"
        attrs[0].getString("value") shouldBe "one"
        attrs[1].getString("key") shouldBe "2"
        attrs[1].getString("value") shouldBe "two"
    }

    private fun minimalDatasetWithGeometryContext(): String {
        // Build from the shared minimal dataset metadata so all required fields are present
        var xml = minimalDatasetMetadata
        // append before end tag
        val mdEnd = xml.indexOf("</gmd:MD_Metadata>")
        xml = xml.take(mdEnd) + geometryContextXml + xml.substring(mdEnd)
        return xml
    }

    // Insert the geometry context block before identificationInfo
    val geometryContextXml = """
            <gmd:spatialRepresentationInfo>
                <igctx:MD_GeometryContext gco:isoType="AbstractMD_SpatialRepresentation_Type">
                    <igctx:geometryType>
                        <gco:CharacterString>test-geometryType</gco:CharacterString>
                    </igctx:geometryType>
                    <igctx:geometricFeature>
                        <igctx:NominalFeature>
                            <igctx:featureName>
                                <gco:CharacterString>test-name</gco:CharacterString>
                            </igctx:featureName>
                            <igctx:featureDescription>
                                <gco:CharacterString>test-description</gco:CharacterString>
                            </igctx:featureDescription>
                            <igctx:featureDataType>
                                <gco:CharacterString>test-datatype</gco:CharacterString>
                            </igctx:featureDataType>
                            <igctx:featureAttributes>
                                <igctx:FeatureAttributes>
                                    <igctx:attribute>
                                        <igctx:RegularFeatureAttribute>
                                            <igctx:attributeDescription>
                                                <gco:CharacterString>one</gco:CharacterString>
                                            </igctx:attributeDescription>
                                            <igctx:attributeCode>
                                                <gco:CharacterString>1</gco:CharacterString>
                                            </igctx:attributeCode>
                                        </igctx:RegularFeatureAttribute>
                                    </igctx:attribute>
                                    <igctx:attribute>
                                        <igctx:RegularFeatureAttribute>
                                            <igctx:attributeDescription>
                                                <gco:CharacterString>two</gco:CharacterString>
                                            </igctx:attributeDescription>
                                            <igctx:attributeCode>
                                                <gco:CharacterString>2</gco:CharacterString>
                                            </igctx:attributeCode>
                                        </igctx:RegularFeatureAttribute>
                                    </igctx:attribute>
                                </igctx:FeatureAttributes>
                            </igctx:featureAttributes>
                            <igctx:minValue>
                                <gco:CharacterString>3.0</gco:CharacterString>
                            </igctx:minValue>
                            <igctx:maxValue>
                                <gco:CharacterString>12.0</gco:CharacterString>
                            </igctx:maxValue>
                            <igctx:units>
                                <gco:CharacterString>test-unit</gco:CharacterString>
                            </igctx:units>
                        </igctx:NominalFeature>
                    </igctx:geometricFeature>
                </igctx:MD_GeometryContext>
            </gmd:spatialRepresentationInfo>
    """.trimIndent()
}
