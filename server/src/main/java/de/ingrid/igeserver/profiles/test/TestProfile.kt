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
package de.ingrid.igeserver.profiles.mcloud

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.model.FacetGroup
import de.ingrid.igeserver.model.Operator
import de.ingrid.igeserver.model.ViewComponent
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Codelist
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Query
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.CodelistRepository
import de.ingrid.igeserver.repository.QueryRepository
import de.ingrid.igeserver.research.quickfilter.DocTest
import de.ingrid.igeserver.research.quickfilter.ExceptFolders
import de.ingrid.igeserver.research.quickfilter.Published
import de.ingrid.igeserver.research.quickfilter.TimeSpan
import de.ingrid.igeserver.research.quickfilter.address.Organisations
import de.ingrid.igeserver.research.quickfilter.address.Persons
import de.ingrid.igeserver.services.CatalogProfile
import de.ingrid.igeserver.services.DateService
import de.ingrid.igeserver.services.IndexIdFieldConfig
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class TestProfile : CatalogProfile {

    @Autowired
    @JsonIgnore
    lateinit var codelistRepo: CodelistRepository

    @Autowired
    @JsonIgnore
    lateinit var catalogRepo: CatalogRepository

    @Autowired
    @JsonIgnore
    lateinit var query: QueryRepository

    @Autowired
    @JsonIgnore
    lateinit var dateService: DateService

    override val identifier = "test"
    override val title = "Test Katalog"
    override val description = null
    override val indexExportFormatID = ""
    override val indexIdField = IndexIdFieldConfig("t01_object.obj_id", "t02_address.adr_id")

    override fun getFacetDefinitionsForDocuments(): Array<FacetGroup> {
        return arrayOf(
            FacetGroup(
                "state", "Allgemein", arrayOf(
                    Published(),
                    ExceptFolders()
                ),
                viewComponent = ViewComponent.CHECKBOX,
                combine = Operator.AND
            ),
            FacetGroup(
                "docType", "Dokumententyp", arrayOf(
                    DocTest()
                )
            ),
            FacetGroup(
                "timeRef", "Zeitbezug", arrayOf(
                    TimeSpan()
                ),
                viewComponent = ViewComponent.TIMESPAN
            )
        )
    }

    override fun getFacetDefinitionsForAddresses(): Array<FacetGroup> {
        return arrayOf(
            FacetGroup(
                "state", "Allgemein", arrayOf(
                    Published(),
                    ExceptFolders()
                ),
                viewComponent = ViewComponent.CHECKBOX
            ),
            FacetGroup(
                "addrType", "Typ", arrayOf(
                    Organisations(),
                    Persons()
                ),
                viewComponent = ViewComponent.CHECKBOX
            )
        )
    }

    override fun initCatalogCodelists(catalogId: String, codelistId: String?) {
        val catalogRef = catalogRepo.findByIdentifier(catalogId)

        val codelist20000 = Codelist().apply {
            identifier = "20000"
            catalog = catalogRef
            name = "mCLOUD Kategorien"
            description = "Dies sind die Kategorien, die innerhalb von mCLOUD verwendet werden"
            data = jacksonObjectMapper().createArrayNode().apply {
                add(toCodelistEntry("railway", "Bahn"))
                add(toCodelistEntry("waters", "Wasserstraßen und Gewässer"))
                add(toCodelistEntry("infrastructure", "Infrastruktur"))
                add(toCodelistEntry("climate", "Klima und Wetter"))
                add(toCodelistEntry("aviation", "Luft- und Raumfahrt"))
                add(toCodelistEntry("roads", "Straßen"))
            }
        }
        val codelist20001 = Codelist().apply {
            identifier = "20001"
            catalog = catalogRef
            name = "OpenData Kategorien"
            description = "Dies sind die Kategorien, die im OpenData Kontext verwendet werden"
            data = jacksonObjectMapper().createArrayNode().apply {
                add(toCodelistEntry("SOCI", "Bevölkerung und Gesellschaft"))
                add(toCodelistEntry("EDUC", "Bildung, Kultur und Sport"))
                add(toCodelistEntry("ENER", "Energie"))
                add(toCodelistEntry("HEAL", "Gesundheit"))
                add(toCodelistEntry("INTR", "Internationale Themen"))
                add(toCodelistEntry("JUST", "Justiz, Rechtssystem und öffentliche Sicherheit"))
                add(toCodelistEntry("AGRI", "Landwirtschaft, Fischerei, Forstwirtschaft und Nahrungsmittel"))
                add(toCodelistEntry("GOVE", "Regierung und öffentlicher Sektor"))
                add(toCodelistEntry("REGI", "Regionen und Städte"))
                add(toCodelistEntry("ENVI", "Umwelt"))
                add(toCodelistEntry("TRAN", "Verkehr"))
                add(toCodelistEntry("ECON", "Wirtschaft und Finanzen"))
                add(toCodelistEntry("TECH", "Wissenschaft und Technologie"))
            }
        }
        val codelist20002 = Codelist().apply {
            identifier = "20002"
            catalog = catalogRef
            name = "Download Typ"
            description = "Dies sind die Typen, die ein Download-Eintrag haben kann"
            data = jacksonObjectMapper().createArrayNode().apply {
                add(toCodelistEntry("API", "API"))
                add(toCodelistEntry("AtomFeed", "AtomFeed"))
                add(toCodelistEntry("Dateidownload", "Dateidownload"))
                add(toCodelistEntry("FTP", "FTP"))
                add(toCodelistEntry("Portal", "Portal"))
                add(toCodelistEntry("Software", "Software"))
                add(toCodelistEntry("SOS", "SOS"))
                add(toCodelistEntry("WCS", "WCS"))
                add(toCodelistEntry("WFS", "WFS"))
                add(toCodelistEntry("WMS", "WMS"))
                add(toCodelistEntry("WMTS", "WMTS"))
            }
        }

        when (codelistId) {
            "20000" -> removeAndAddCodelist(catalogId, codelist20000)
            "20001" -> removeAndAddCodelist(catalogId, codelist20001)
            "20002" -> removeAndAddCodelist(catalogId, codelist20002)
            null -> {
                removeAndAddCodelist(catalogId, codelist20000)
                codelistRepo.save(codelist20000)
                removeAndAddCodelist(catalogId, codelist20001)
                codelistRepo.save(codelist20001)
                removeAndAddCodelist(catalogId, codelist20002)
                codelistRepo.save(codelist20002)
            }
            else -> throw ClientException.withReason("Codelist $codelistId is not supported by this profile: $identifier")
        }
    }

    override fun initCatalogQueries(catalogId: String) {
        val queryTest = Query().apply {
            this.catalog = catalogRepo.findByIdentifier(catalogId)
            category = "facet"
            name = "Alle Test-Dokumente"
            description = "Zeigt alle Dokumente vom Typ Test"
            data = jacksonObjectMapper().createObjectNode().apply {
                val model = jacksonObjectMapper().createObjectNode().apply {
                    put("type", "selectDocuments")
                    set<ObjectNode>("docType", jacksonObjectMapper().createObjectNode().apply {
                        put("selectDocTest", true)
                    })
                }
                set<ObjectNode>("model", model)
            }
            modified = dateService.now()
        }
        query.save(queryTest)
    }

    override fun initIndices() {
    }

    override fun getElasticsearchMapping(format: String): String {
        return ""
    }

    override fun getElasticsearchSetting(format: String): String {
        return ""
    }

    private fun removeAndAddCodelist(catalogId: String, codelist: Codelist) {

        codelistRepo.deleteByCatalog_IdentifierAndIdentifier(catalogId, codelist.identifier)
        codelistRepo.flush()
        codelistRepo.save(codelist)

    }

    private fun toCodelistEntry(id: String, german: String): JsonNode {
        return jacksonObjectMapper().createObjectNode().apply {
            put("id", id)
            set<JsonNode>("localisations", jacksonObjectMapper().createObjectNode().apply {
                put("de", german)
            })
        }
    }
}
