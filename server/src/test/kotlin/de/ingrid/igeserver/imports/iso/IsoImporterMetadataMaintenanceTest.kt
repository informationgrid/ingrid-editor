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
package de.ingrid.igeserver.imports.iso

import de.ingrid.igeserver.DummyCatalog
import de.ingrid.igeserver.imports.minimalDatasetMetadata
import de.ingrid.igeserver.model.ResearchResponse
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.ISOImport
import de.ingrid.igeserver.profiles.ingrid_nlpv.importer.ISOImportNLPV
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

class IsoImporterMetadataMaintenanceTest : AnnotationSpec() {

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
        every { documentService.getWrapperByCatalogAndDocumentUuid(any(), any()) } returns DocumentWrapper()
        // Simplify research: return no hits by default
        every { researchService.query(any(), any(), any()) } returns ResearchResponse(0, emptyList())
    }

    @Test
    fun metadataMaintenanceNotImportedByDefault() {
        val isoImporter = ISOImport(codelistService, catalogService, documentService, researchService, bwastrLocatorService, uploadConfig)

        val xml = minimalDatasetWithMetadataMaintenance()
        val result = isoImporter.run("test", xml, mutableMapOf())

        // metadata/maintenanceInformation must NOT be present for default profile/settings
        result[0].get("metadata").get("maintenanceInformation").shouldBeNull()
    }

    @Test
    fun metadataMaintenanceImportedForNlpv() {
        val isoImporter = ISOImport(codelistService, catalogService, documentService, researchService, bwastrLocatorService, uploadConfig)
        // Enable profile handler for ingrid-nlpv which imports MetadataMaintenance
        isoImporter.profileMapper["ingrid-nlpv"] = ISOImportNLPV()
        every { catalogService.getProfileFromCatalog(any()) } returns DummyCatalog("ingrid-nlpv")

        val xml = minimalDatasetWithMetadataMaintenance()
        val result = isoImporter.run("test", xml, mutableMapOf())

        val metadataMaintenanceInformation = result[0].get("metadata").get("maintenanceInformation")

        // Should contain the metadataMaintenance information mapped from XML
        metadataMaintenanceInformation.isObject shouldBe true
        metadataMaintenanceInformation.getString("description") shouldBe "Eine Beschreibung (maintenanceNote)"

        val maintenanceAndUpdateFrequency = metadataMaintenanceInformation.get("maintenanceAndUpdateFrequency")
        maintenanceAndUpdateFrequency.getString("key") shouldBe "1"
        maintenanceAndUpdateFrequency.getString("value") shouldBe "kontinuierlich"
        maintenanceAndUpdateFrequency.getString("_codelistId") shouldBe "518"

        val userDefinedMaintenanceFrequency = metadataMaintenanceInformation.get("userDefinedMaintenanceFrequency")
        userDefinedMaintenanceFrequency.getString("number") shouldBe "15"
        userDefinedMaintenanceFrequency.get("unit").getString("key") shouldBe "5"
        userDefinedMaintenanceFrequency.get("unit").getString("value") shouldBe "Monate"
        userDefinedMaintenanceFrequency.get("unit").getString("_codelistId") shouldBe "1230"
    }

    private fun minimalDatasetWithMetadataMaintenance(): String {
        // Build from the shared minimal dataset metadata so all required fields are present
        var xml = minimalDatasetMetadata
        // append before end tag
        val mdEnd = xml.indexOf("</gmd:MD_Metadata>")
        xml = xml.take(mdEnd) + metadataMaintenance + xml.substring(mdEnd)
        return xml
    }

    val metadataMaintenance = """
        <gmd:metadataMaintenance>
            <gmd:MD_MaintenanceInformation>
                <gmd:maintenanceAndUpdateFrequency>
                    <gmd:MD_MaintenanceFrequencyCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_MaintenanceFrequencyCode" codeListValue="continual"/>
                </gmd:maintenanceAndUpdateFrequency>
                <gmd:userDefinedMaintenanceFrequency>
                    <gts:TM_PeriodDuration>P15M</gts:TM_PeriodDuration>
                </gmd:userDefinedMaintenanceFrequency>
                <gmd:updateScope>
                    <gmd:MD_ScopeCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_ScopeCode" codeListValue="dataset"/>
                </gmd:updateScope>
                <gmd:maintenanceNote>
                    <gco:CharacterString>Eine Beschreibung (maintenanceNote)</gco:CharacterString>
                </gmd:maintenanceNote>
            </gmd:MD_MaintenanceInformation>
        </gmd:metadataMaintenance>
    """.trimIndent()
}
