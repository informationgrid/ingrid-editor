package de.ingrid.igeserver.services.geothesaurus

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.dataformat.xml.JacksonXmlModule
import com.fasterxml.jackson.dataformat.xml.XmlMapper
import de.ingrid.igeserver.services.thesaurus.ThesaurusSearchType
import org.springframework.stereotype.Service

@Service
class WfsGndeGeoThesaurus : GeoThesaurusService() {

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
    <wfs:GetFeature traverseXlinkDepth="*" resultType="results" version="1.1.0" service="WFS" xmlns:wfs="http://www.opengis.net/wfs"  xmlns:ogc="http://www.opengis.net/ogc"          >
        <wfs:Query featureVersion="1.1.0" typeName="gn:GnObjekt" xmlns:gn="http://www.geodatenzentrum.de/gnde">
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
        val result = mapper.readTree(response).get("featureMember")
            ?.mapNotNull { mapToSpatial(it.get("GnObjekt")) }
            ?.toSet()?.toList() ?: emptyList()
            
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

    private fun mapToSpatial(featureMember: JsonNode?): SpatialResponse? {
        if (featureMember == null) return null
        
        val (typeName, typeId) = getType(featureMember)
        return SpatialResponse(
            featureMember.get("nnid").asText(),
            typeName,
            typeId,
            mapName(featureMember),
            mapBoundingBox(featureMember),
            getARS(featureMember)
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
        val posList = featureMember.get("box")?.get("Polygon")?.get("exterior")?.get("LinearRing")?.get("posList")
        return getBBoxFromPosListElement(posList!!)
    }

    private fun getBBoxFromPosListElement(coords: JsonNode): BoundingBox {
        val coordsSplitted = coords.asText().split(" ")
        val box = FloatArray(4)

        // determine bounding box from polygon by getting min/max values
        var pos = 0
        while (pos < coordsSplitted.size) {
            if (box[0] == 0.0f || box[1] > coordsSplitted[pos].toFloat()) {
                box[0] = coordsSplitted[pos].toFloat()
            }
            if (box[1] == 0.0f || box[0] > coordsSplitted[pos + 1].toFloat()) {
                box[1] = coordsSplitted[pos + 1].toFloat()
            }
            if (box[2] < coordsSplitted[pos].toFloat()) {
                box[2] = coordsSplitted[pos].toFloat()
            }
            if (box[3] < coordsSplitted[pos + 1].toFloat()) {
                box[3] = coordsSplitted[pos + 1].toFloat()
            }
            pos += 2
        }
        return BoundingBox(box[0], box[1], box[2], box[3])
    }

    private fun mapName(featureMember: JsonNode): String? {
        val endonyms = featureMember.get("hatEndonym")
        return when (endonyms?.size()) {
            null -> null
            1 -> endonyms.get("Endonym").get("name").asText()
            else -> {
                val endo = endonyms.get(0)?.get("Endonym")
                "${endo?.get("name")?.asText()} (${endonyms.get(1)?.get("Endonym")?.get("name")?.asText()})"
            }
        }
    }
}

private fun convertType(searchType: ThesaurusSearchType, term: String): String {
    return when (searchType) {
        ThesaurusSearchType.EXACT -> term
        ThesaurusSearchType.BEGINS_WITH -> "$term*"
        ThesaurusSearchType.ENDS_WITH -> "*$term"
        ThesaurusSearchType.CONTAINS -> "*$term*"
    }
}

