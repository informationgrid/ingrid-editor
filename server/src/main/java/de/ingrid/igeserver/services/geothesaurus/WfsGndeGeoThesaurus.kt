package de.ingrid.igeserver.services.geothesaurus

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.dataformat.xml.JacksonXmlModule
import com.fasterxml.jackson.dataformat.xml.XmlMapper
import de.ingrid.igeserver.services.thesaurus.ThesaurusSearchType
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

@Service
class WfsGndeGeoThesaurus : GeoThesaurusService() {

    @Value("\${geothesaurus.max.results:50}")
    private val maxResults: Int = 50
    
    override val id = "wfsgnde"

    val searchUrlTemplate = "http://sg.geodatenzentrum.de/wfs_gnde"

    val filterTypes = listOf(
        "AX_Gemeinde",
        "AX_Bundesland",
        "AX_Regierungsbezirk",
        "AX_KreisRegion",
        "AX_Nationalstaat",
        "AX_Landschaft",
        "AX_StehendesGewaesser",
        "AX_Meer",
        "AX_Insel",
        "AX_SchutzgebietNachNaturUmweltOderBodenschutzrecht"
    )

    private fun template(query: String): String {
        val filter = filterTypes.map {
            """
            <ogc:PropertyIsEqualTo matchCase="true">
                <ogc:PropertyName>gn:hatObjektart/gn:Objektart/gn:objektart</ogc:PropertyName>
                <ogc:Literal>$it</ogc:Literal>
            </ogc:PropertyIsEqualTo>
            """.trimIndent()
        }.joinToString("")
        return """
    <wfs:GetFeature maxFeatures="$maxResults" traverseXlinkDepth="*" resultType="results" version="1.1.0" service="WFS" xmlns:wfs="http://www.opengis.net/wfs"  xmlns:ogc="http://www.opengis.net/ogc"          >
        <wfs:Query featureVersion="1.1.0" typeName="gn:GnObjekt" xmlns:gn="http://www.geodatenzentrum.de/gnde" srsName="EPSG:4326">
            <ogc:Filter>
                <ogc:And>
                    <ogc:PropertyIsLike wildCard="*" singleChar="?" matchCase="false" escapeChar="\">
                        <ogc:PropertyName>gn:hatEndonym/gn:Endonym/gn:name</ogc:PropertyName>
                        <ogc:Literal>${query}</ogc:Literal>
                    </ogc:PropertyIsLike>
                    <ogc:Or>
                        $filter
                    </ogc:Or>
                </ogc:And>
            </ogc:Filter>
        </wfs:Query>
    </wfs:GetFeature>""".trimIndent()
    }

    override fun search(term: String, options: GeoThesaurusSearchOptions): List<SpatialResponse> {
        if (term.isEmpty()) return emptyList()

//        val adaptedTerm = convertType(options.searchType, term)
        val response = sendRequest("POST", searchUrlTemplate, template(term))
        val mapper = XmlMapper(JacksonXmlModule())
        val featureMember = mapper.readTree(response).get("featureMember")
        
        val result = if (featureMember is ObjectNode) {
            listOfNotNull(mapToSpatial(featureMember.get("GnObjekt"), false))
        }else {
            val maxReached = featureMember?.size() == maxResults
            featureMember
                ?.mapNotNull { mapToSpatial(it.get("GnObjekt"), maxReached) }
                ?.toSet()?.toList() ?: emptyList()
        }
        return resolveTypeReferences(result)
    }

    private fun resolveTypeReferences(spatials: List<SpatialResponse>): List<SpatialResponse> {
        return spatials.map {spatial ->
            if (spatial.type.startsWith("#")) {
                spatial.type = spatials.find { it.typeId ==  spatial.type.substring(1)}?.type!!
            }
            spatial
        }
    }

    private fun mapToSpatial(featureMember: JsonNode?, maxReached: Boolean): SpatialResponse? {
        if (featureMember == null) return null
        
        val (typeName, typeId) = getType(featureMember)
        return SpatialResponse(
            featureMember.get("nnid").asText(),
            typeName,
            typeId,
            mapName(featureMember),
            mapBoundingBox(featureMember),
            getARS(featureMember),
            maxReached
        )
    }

    private fun getARS(featureMember: JsonNode): String? {
        return featureMember.get("hatArs")?.get("Ars")?.get("ars")?.asText()
    }

    private fun getType(featureMember: JsonNode): Pair<String,String?> {
        val href = featureMember.get("hatObjektart")?.get("href")?.asText()
        return if (href != null) Pair(href, null) else {
            val type = featureMember.get("hatObjektart")?.get("Objektart")?.get("objektart")?.asText()!!
            val typeId = featureMember.get("hatObjektart")?.get("Objektart")?.get("id")?.asText()!!
            Pair(type, typeId)
        }
    }

    private fun mapBoundingBox(featureMember: JsonNode): BoundingBox {
        val posListLower = featureMember.get("boundedBy")?.get("Envelope")?.get("lowerCorner")?.asText()?.split(" ")
        val posListUpper = featureMember.get("boundedBy")?.get("Envelope")?.get("upperCorner")?.asText()?.split(" ")
        return getBBoxFromBoundedByElement(posListLower!!, posListUpper!!)
    }
    
    private fun getBBoxFromBoundedByElement(lower: List<String>, upper: List<String>): BoundingBox {
        return BoundingBox(lower[1].toFloat(), lower[0].toFloat(), upper[1].toFloat(), upper[0].toFloat())
    }

    private fun mapName(featureMember: JsonNode): String? {
        val endonyms = featureMember.get("hatEndonym")
        return when (endonyms?.size()) {
            null -> null
            1 -> endonyms.get("Endonym").get("name").asText()
            else -> {

                getGermanName(featureMember)?.let { return it }
                
                val endo = endonyms.get(0)?.get("Endonym")
                "${endo?.get("name")?.asText()} (${endonyms.get(1)?.get("Endonym")?.get("name")?.asText()})"
            }
        }
    }

    private fun getGermanName(featureMember: JsonNode) = featureMember.get("hatEndonym").find {
        val hatSprache = it?.get("Endonym")?.get("hatSprache")
        hatSprache?.get("Sprache")?.get("sprache_ID")?.asText() == "1" || hatSprache?.get("href")?.asText() == "#Spr_1"
    }?.get("Endonym")?.get("name")?.asText()
}

private fun convertType(searchType: ThesaurusSearchType, term: String): String {
    return when (searchType) {
        ThesaurusSearchType.EXACT -> term
        ThesaurusSearchType.BEGINS_WITH -> "$term*"
        ThesaurusSearchType.ENDS_WITH -> "*$term"
        ThesaurusSearchType.CONTAINS -> "*$term*"
    }
}

