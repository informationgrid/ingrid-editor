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
package de.ingrid.igeserver.imports.iso

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.DummyCatalog
import de.ingrid.igeserver.imports.*
import de.ingrid.igeserver.profiles.ingrid.importer.ISOImport
import de.ingrid.igeserver.repository.DocumentRepository
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.utils.getString
import io.kotest.assertions.json.shouldEqualJson
import io.kotest.core.spec.style.AnnotationSpec
import io.mockk.every
import io.mockk.mockk
import mockCodelists
import java.nio.file.Files
import java.nio.file.Paths

class IsoImporterTest : AnnotationSpec() {

    private val codelistService = mockk<CodelistHandler>()
    private val catalogService = mockk<CatalogService>()
    private val documentService = mockk<DocumentService>()
    private val documentRepository = mockk<DocumentRepository>()

    @BeforeAll
    fun beforeAll() {
        mockCodelists(codelistService)
        every { codelistService.getCatalogCodelistKey("test", "1350", "Nieders. Abfallgesetz (NAbfG)") } returns "38"
        every { codelistService.getCatalogCodelistKey("test", "3535", "von Drachenfels 94") } returns "1"
        every { codelistService.getCatalogCodelistKey("test", "3555", "Ganzflächige Biotopkartierung 94") } returns "1"
        every { codelistService.getCatalogCodelistKey("test", "6250", "Hessen") } returns "7"
        every { catalogService.getProfileFromCatalog(any()) } returns DummyCatalog()
        every { documentService.docRepo } returns documentRepository
        every { documentRepository.findAddressByOrganisationName(any()) } returns null
    }

    @Test
    fun importGeoservice() {
        val isoImporter = ISOImport(codelistService, catalogService, documentService)
        val result = isoImporter.run("test", getFile("ingrid/import/iso_geoservice_full.xml"))

        changeUuidOfOrganisationTo(result, "Objektbesitzer Institut", "D")
        changeUuidOfOrganisationTo(result, "Adressvererbung Test", "C")
        changeUuidOfOrganisationTo(result, "Some Organisation", "some_organisation")

        result.toPrettyString().shouldEqualJson(
            getFile("ingrid/import/iso_geoservice_full-expected.json")
        )
    }

    @Test
    fun importGeodataset() {
        val isoImporter = ISOImport(codelistService, catalogService, documentService)
        val result = isoImporter.run("test", getFile("ingrid/import/iso_geodataset_full.xml"))

        changeUuidOfOrganisationTo(result, "Some Organisation", "some_organisation")
        
        result.toPrettyString().shouldEqualJson(
            getFile("ingrid/import/iso_geodataset_full-expected.json")
        )
    }

    @Test
    fun addressHierarchy1() {
        val isoImporter = ISOImport(codelistService, catalogService, documentService)

        val data = addPointOfContact(
            minimalMetadata, """
            <gmd:pointOfContact>
                    <gmd:CI_ResponsibleParty uuid="2B83F58E-60C2-11D6-884A-0000F4ABB4D8">
                        <gmd:individualName>
                            <gco:CharacterString>Besitzername, Besitzervorname, Herr</gco:CharacterString>
                        </gmd:individualName>
                        <gmd:role>
                            <gmd:CI_RoleCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_RoleCode" codeListValue="resourceProvider"/>
                        </gmd:role>
                    </gmd:CI_ResponsibleParty>
                </gmd:pointOfContact>
        """.trimIndent()
        )

        val result = isoImporter.run("test", data)
        assertPointOfContact(result, "2B83F58E-60C2-11D6-884A-0000F4ABB4D8", expectedPersonSingle)
    }

    @Test
    fun addressHierarchy2() {
        val isoImporter = ISOImport(codelistService, catalogService, documentService)

        val data = addPointOfContact(
            minimalMetadata, """
            <gmd:pointOfContact>
                    <gmd:CI_ResponsibleParty uuid="2B83F58E-60C2-11D6-884A-0000F4ABB4D8">
                        <gmd:individualName>
                            <gco:CharacterString>Besitzername, Besitzervorname, Herr</gco:CharacterString>
                        </gmd:individualName>
                        <gmd:positionName>
                            <gco:CharacterString>Liegenschaftsbuch (ALB)</gco:CharacterString>
                        </gmd:positionName>
                        <gmd:role>
                            <gmd:CI_RoleCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_RoleCode" codeListValue="resourceProvider"/>
                        </gmd:role>
                    </gmd:CI_ResponsibleParty>
                </gmd:pointOfContact>
        """.trimIndent()
        )

        val result = isoImporter.run("test", data)
        assertPointOfContact(result, "2B83F58E-60C2-11D6-884A-0000F4ABB4D8", expectedPersonPositionName)
    }

    @Test
    fun addressHierarchy3() {
        val isoImporter = ISOImport(codelistService, catalogService, documentService)

        val data = addPointOfContact(
            minimalMetadata, """
            <gmd:pointOfContact>
                    <gmd:CI_ResponsibleParty uuid="2B83F58E-60C2-11D6-884A-0000F4ABB4D8">
                        <gmd:individualName>
                            <gco:CharacterString>Besitzername, Besitzervorname, Herr</gco:CharacterString>
                        </gmd:individualName>
                        <gmd:organisationName>
                            <gco:CharacterString>Objektbesitzer Institut</gco:CharacterString>
                        </gmd:organisationName>
                        <gmd:positionName>
                            <gco:CharacterString>Liegenschaftsbuch (ALB)</gco:CharacterString>
                        </gmd:positionName>
                        <gmd:role>
                            <gmd:CI_RoleCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_RoleCode" codeListValue="resourceProvider"/>
                        </gmd:role>
                    </gmd:CI_ResponsibleParty>
                </gmd:pointOfContact>
        """.trimIndent()
        )

        val result = isoImporter.run("test", data)
        changeUuidOfOrganisationTo(result, "Objektbesitzer Institut", "D")

        assertPointOfContact(result, "Objektbesitzer Institut", expectedParentOrganisation)
        assertPointOfContact(result, "2B83F58E-60C2-11D6-884A-0000F4ABB4D8", expectedPersonUnderOrganisation)
    }
    
    @Test
    fun addressHierarchy4() {
        val isoImporter = ISOImport(codelistService, catalogService, documentService)

        val data = addPointOfContact(
            minimalMetadata, """
            <gmd:pointOfContact>
                    <gmd:CI_ResponsibleParty uuid="2B83F58E-60C2-11D6-884A-0000F4ABB4D8">
                        <gmd:individualName>
                            <gco:CharacterString>Besitzername, Besitzervorname, Herr</gco:CharacterString>
                        </gmd:individualName>
                        <gmd:organisationName>
                            <gco:CharacterString>Objektbesitzer Institut</gco:CharacterString>
                        </gmd:organisationName>
                        <gmd:positionName>
                            <gco:CharacterString>Referat 1,Abteilung 3</gco:CharacterString>
                        </gmd:positionName>
                        <gmd:role>
                            <gmd:CI_RoleCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_RoleCode" codeListValue="resourceProvider"/>
                        </gmd:role>
                    </gmd:CI_ResponsibleParty>
                </gmd:pointOfContact>
        """.trimIndent()
        )

        val result = isoImporter.run("test", data)
        changeUuidOfOrganisationTo(result, "Objektbesitzer Institut", "D")
        changeUuidOfOrganisationTo(result, "Referat 1", "A")
        changeUuidOfOrganisationTo(result, "Abteilung 3", "B")

        assertPointOfContact(result, "Objektbesitzer Institut", expectedParentOrganisation)
        assertPointOfContact(result, "2B83F58E-60C2-11D6-884A-0000F4ABB4D8", expectedPersonUnderOrganisation2)
    }

    @Test
    fun addressHierarchy5() {
        val isoImporter = ISOImport(codelistService, catalogService, documentService)

        val data = addPointOfContact(
            minimalMetadata, """
            <gmd:pointOfContact>
                    <gmd:CI_ResponsibleParty uuid="2B83F58E-60C2-11D6-884A-0000F4ABB4D8">
                        <gmd:organisationName>
                            <gco:CharacterString>Objektbesitzer Institut</gco:CharacterString>
                        </gmd:organisationName>
                        <gmd:role>
                            <gmd:CI_RoleCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_RoleCode" codeListValue="resourceProvider"/>
                        </gmd:role>
                    </gmd:CI_ResponsibleParty>
                </gmd:pointOfContact>
        """.trimIndent()
        )

        val result = isoImporter.run("test", data)
        changeUuidOfOrganisationTo(result, "Objektbesitzer Institut", "D")
        
        assertPointOfContact(result, "Objektbesitzer Institut", expectedParentOrganisation)
    }

    @Test
    fun addressHierarchy6() {
        val isoImporter = ISOImport(codelistService, catalogService, documentService)

        val data = addPointOfContact(
            minimalMetadata, """
            <gmd:pointOfContact>
                    <gmd:CI_ResponsibleParty uuid="2B83F58E-60C2-11D6-884A-0000F4ABB4D8">
                        <gmd:organisationName>
                            <gco:CharacterString>Objektbesitzer Institut</gco:CharacterString>
                        </gmd:organisationName>
                        <gmd:positionName>
                            <gco:CharacterString>Something</gco:CharacterString>
                        </gmd:positionName>
                        <gmd:role>
                            <gmd:CI_RoleCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_RoleCode" codeListValue="resourceProvider"/>
                        </gmd:role>
                    </gmd:CI_ResponsibleParty>
                </gmd:pointOfContact>
        """.trimIndent()
        )

        val result = isoImporter.run("test", data)
        assertPointOfContact(result, "Objektbesitzer Institut", expectedOrganisationWithPositionName)
    }

    private fun addPointOfContact(metadata: String, pointOfContact: String): String {
        val position = metadata.indexOf("</srv:SV_ServiceIdentification>")
        val start = metadata.substring(0, position)
        val end = metadata.substring(position, metadata.length)

        return start + pointOfContact + end
    }

    private fun getFile(file: String) =
        String(Files.readAllBytes(Paths.get(ClassLoader.getSystemResource(file).toURI())))

    private fun assertPointOfContact(json: JsonNode, nameOrUuid: String, expected: String) {
        val contacts = json.get("pointOfContact") as? ArrayNode ?: throw RuntimeException()

        val contact = contacts.firstNotNullOfOrNull { item ->
            val orgNode = item.getString("ref.organization")
            val uuid = item.getString("ref._uuid")
            if (orgNode == nameOrUuid || uuid == nameOrUuid) {
                item.get("ref").toPrettyString().replace("\r", "")
            } else null
        } ?: throw RuntimeException("PointOfContact with '$nameOrUuid' not found")
        
        contact.shouldEqualJson(expected)
    }

    private fun changeUuidOfOrganisationTo(json: JsonNode, name: String, uuid: String) {
        val contacts = json.get("pointOfContact") as? ArrayNode ?: return
        var oldUuid: String? = null

        // First, find and update the uuids for matching organizations
        contacts.forEach { item ->
            val orgNode = item.getString("ref.organization")
            if (orgNode == name) {
                oldUuid = item.getString("ref._uuid")
                (item.get("ref") as? ObjectNode)?.put("_uuid", uuid)
            }
        }

        if (oldUuid == null) return
        // Next, update parentAsUuid fields if they match any oldUuid
        contacts.forEach { item ->
            val parentAsUuid = item.getString("ref.parentAsUuid")
            if (oldUuid == parentAsUuid) {
                (item.get("ref") as? ObjectNode)?.put("parentAsUuid", uuid)
            }
        }
    }
}
