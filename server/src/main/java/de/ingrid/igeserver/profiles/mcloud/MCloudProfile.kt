package de.ingrid.igeserver.profiles.mcloud

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.model.FacetGroup
import de.ingrid.igeserver.model.Operator
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Codelist
import de.ingrid.igeserver.profiles.CatalogProfile
import de.ingrid.igeserver.profiles.mcloud.research.quickfilter.Spatial
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.CodelistRepository
import de.ingrid.igeserver.research.quickfilter.DocMCloud
import de.ingrid.igeserver.research.quickfilter.DocTest
import de.ingrid.igeserver.research.quickfilter.ExceptFolders
import de.ingrid.igeserver.research.quickfilter.Published
import de.ingrid.igeserver.research.quickfilter.address.Organisations
import de.ingrid.igeserver.research.quickfilter.address.Persons
import org.springframework.beans.factory.annotation.Autowired
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
                    DocTest()
                )
            ),
            FacetGroup(
                "spatial", "Raumbezug", arrayOf(
                    Spatial()
                ),
                selection = Operator.SPATIAL
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

    override fun initCatalogCodelists(catalogId: String) {
        val catalogRef = catalogRepo.findByIdentifier(catalogId)
        
        val codelist20000 = Codelist().apply {
            identifier = "20000"
            catalog = catalogRef
            name = "mCLOUD Kategorien"
            data = jacksonObjectMapper().createArrayNode().apply {
                add(toCodelistEntry("railway", "Bahn"))
                add(toCodelistEntry("waters","Wasserstraßen und Gewässer"))
                add(toCodelistEntry( "infrastructure","Infrastruktur"))
                add(toCodelistEntry("climate", "Klima und Wetter"))
                add(toCodelistEntry("aviation", "Luft- und Raumfahrt"))
                add(toCodelistEntry("roads", "Straßen"))
            }
        }
        val codelist20001 = Codelist().apply {
            identifier = "20001"
            catalog = catalogRef
            name = "OpenData Kategorien"
            data = jacksonObjectMapper().createArrayNode().apply {
                add(toCodelistEntry("SOCI", "Bevölkerung und Gesellschaft"))
                add(toCodelistEntry("EDUC","Bildung, Kultur und Sport"))
                add(toCodelistEntry( "ENER","Energie"))
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
        codelistRepo.save(codelist20000)
        codelistRepo.save(codelist20001)
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