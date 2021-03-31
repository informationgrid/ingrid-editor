package de.ingrid.igeserver.profiles.mcloud

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.model.FacetGroup
import de.ingrid.igeserver.model.Operator
import de.ingrid.igeserver.persistence.postgresql.PostgreSQLAccess
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Codelist
import de.ingrid.igeserver.profiles.CatalogProfile
import de.ingrid.igeserver.profiles.mcloud.research.quickfilter.Spatial
import de.ingrid.igeserver.research.quickfilter.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service

@Service()
@Profile("mcloud")
class MCloudProfile : CatalogProfile {

    @Autowired
    @JsonIgnore
    lateinit var db: PostgreSQLAccess

    override val identifier: String = "mcloud"
    override val title: String = "mCLOUD Katalog"
    override val description: String? = null

    override fun getFacetDefinitions(): Array<FacetGroup> {
        return arrayOf(
            FacetGroup(
                "state", "Zustand", arrayOf(
                    Latest(),
                    Published(),
                ),
                selection = Operator.RADIO
            ),
            FacetGroup(
                "docType", "Dokumententyp", arrayOf(
                    DocMCloud(),
                    DocTest()
                )
            ),
            FacetGroup(
                "spatial", "Raumbezug (mCLOUD)", arrayOf(
                    Spatial()
                ),
                selection = Operator.SPATIAL
            )
        )
    }

    override fun initCatalogCodelists() {
        val codelist20000 = Codelist().apply {
            identifier = "20000"
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
        db.save(codelist20000)
        db.save(codelist20001)
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