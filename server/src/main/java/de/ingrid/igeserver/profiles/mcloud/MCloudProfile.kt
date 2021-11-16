package de.ingrid.igeserver.profiles.mcloud

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.model.FacetGroup
import de.ingrid.igeserver.model.Operator
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Codelist
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Query
import de.ingrid.igeserver.profiles.CatalogProfile
import de.ingrid.igeserver.profiles.mcloud.research.quickfilter.Spatial
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.CodelistRepository
import de.ingrid.igeserver.repository.QueryRepository
import de.ingrid.igeserver.research.quickfilter.*
import de.ingrid.igeserver.research.quickfilter.address.Organisations
import de.ingrid.igeserver.research.quickfilter.address.Persons
import de.ingrid.igeserver.services.DateService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service

@Service()
@Profile("mcloud")
class MCloudProfile : CatalogProfile {

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

    @Value("#{'\${spring.profiles.active:}'.indexOf('demo') != -1}")
    private val demoMode = false

    override val identifier: String = "mcloud"
    override val title: String = "mCLOUD Katalog"
    override val description: String? = null

    override fun getFacetDefinitionsForDocuments(): Array<FacetGroup> {
        return arrayOf(
            FacetGroup(
                "state", "Allgemein", arrayOf(
                    Published(),
                    ExceptFolders()
                ),
                selection = Operator.CHECKBOX
            ),
            FacetGroup(
                "docType", "Dokumententyp", arrayOf(
                    DocMCloud(),
                    *(if (demoMode) arrayOf() else arrayOf(DocTest()))
                )
            ),
            FacetGroup(
                "spatial", "Raumbezug", arrayOf(
                    Spatial()
                ),
                selection = Operator.SPATIAL
            ),
            FacetGroup(
                "timeRef", "Zeitbezug", arrayOf(
                    TimeSpan()
                ),
                selection = Operator.TIMESPAN
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
                selection = Operator.CHECKBOX
            ),
            FacetGroup(
                "addrType", "Typ", arrayOf(
                    Organisations(),
                    Persons()
                ),
                selection = Operator.CHECKBOX
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
                codelistRepo.save(codelist20000)
                codelistRepo.save(codelist20001)
                codelistRepo.save(codelist20002)
            }
            else -> throw ClientException.withReason("Codelist $codelistId is not supported by this profile: $identifier")
        }
    }

    override fun initCatalogQueries(catalogId: String) {
        val querymCloud = Query().apply {
            this.catalog = catalogRepo.findByIdentifier(catalogId)
            category = "facet"
            name = "Alle mCloud-Dokumente"
            description = "Zeigt alle Dokumente vom Typ mCloud"
            data = jacksonObjectMapper().createObjectNode().apply {
                val model = jacksonObjectMapper().createObjectNode().apply {
                    put("type", "selectDocuments")
                    set<ObjectNode>("docType", jacksonObjectMapper().createObjectNode().apply {
                        put("selectDocMCloud", true)
                    })
                }
                set<ObjectNode>("model", model)
            }
            modified = dateService.now()
        }
        query.save(querymCloud)
    }

    override fun getElasticsearchMapping(format: String): String {
        return {}.javaClass.getResource("/mcloud/default-mapping.json")?.readText() ?: ""
    }

    override fun getElasticsearchSetting(format: String): String {
        return {}.javaClass.getResource("/mcloud/default-settings.json")?.readText() ?: ""
    }

    private fun removeAndAddCodelist(catalogId: String, codelist: Codelist) {

        codelistRepo.deleteByCatalog_IdentifierAndIdentifier(catalogId, codelist.identifier)
        codelistRepo.flush()
        codelistRepo.save(codelist)

    }

    private fun toCodelistEntry(id: String, german: String, english: String? = null): JsonNode {
        return jacksonObjectMapper().createObjectNode().apply {
            put("id", id)
            put("localisations", jacksonObjectMapper().createObjectNode().apply {
                put("de", german)
            })
        }
    }
}
