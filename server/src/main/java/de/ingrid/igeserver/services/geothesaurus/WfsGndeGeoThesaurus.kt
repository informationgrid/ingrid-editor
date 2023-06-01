package de.ingrid.igeserver.services.geothesaurus

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.dataformat.xml.JacksonXmlModule
import com.fasterxml.jackson.dataformat.xml.XmlMapper
import org.springframework.stereotype.Service
import java.net.URLEncoder

@Service
class WfsGndeGeoThesaurus : GeoThesaurusService() {

    override val id = "wfsgnde"

    val searchUrlTemplate = "http://sg.geodatenzentrum.de/wfs_gnde"
    
    private fun template(query: String) = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <wfs:GetFeature traverseXlinkDepth="*" resultType="results" version="1.1.0" service="WFS" xmlns:wfs="http://www.opengis.net/wfs"  xmlns:ogc="http://www.opengis.net/ogc"          >
          <wfs:Query featureVersion="1.1.0" typeName="gn:GnObjekt" >
            <ogc:Filter>
              <ogc:And>
                <ogc:PropertyIsLike wildCard="*" singleChar="?" matchCase="false" escapeChar="\\">
                  <ogc:PropertyName>gn:hatEndonym/gn:Endonym/gn:name</ogc:PropertyName>
                <ogc:Literal>*Hannover*</ogc:Literal>
                </ogc:PropertyIsLike>
                <ogc:Or>
                  <ogc:PropertyIsEqualTo matchCase="true">
                    <ogc:PropertyName>gn:hatObjektart/gn:Objektart/gn:objektart</ogc:PropertyName>
                    <ogc:Literal>AX_Gemeinde</ogc:Literal>
                  </ogc:PropertyIsEqualTo>
                  <ogc:PropertyIsEqualTo matchCase="true">
                    <ogc:PropertyName>gn:hatObjektart/gn:Objektart/gn:objektart</ogc:PropertyName>
                    <ogc:Literal>AX_Bundesland</ogc:Literal>
                  </ogc:PropertyIsEqualTo>
                  <ogc:PropertyIsEqualTo matchCase="true">
                    <ogc:PropertyName>gn:hatObjektart/gn:Objektart/gn:objektart</ogc:PropertyName>
                    <ogc:Literal>AX_Regierungsbezirk</ogc:Literal>
                  </ogc:PropertyIsEqualTo>
                  <ogc:PropertyIsEqualTo matchCase="true">
                    <ogc:PropertyName>gn:hatObjektart/gn:Objektart/gn:objektart</ogc:PropertyName>
                    <ogc:Literal>AX_KreisRegion</ogc:Literal>
                  </ogc:PropertyIsEqualTo>
                  <ogc:PropertyIsEqualTo matchCase="true">
                    <ogc:PropertyName>gn:hatObjektart/gn:Objektart/gn:objektart</ogc:PropertyName>
                    <ogc:Literal>AX_Nationalstaat</ogc:Literal>
                  </ogc:PropertyIsEqualTo>
                  <ogc:PropertyIsEqualTo matchCase="true">
                    <ogc:PropertyName>gn:hatObjektart/gn:Objektart/gn:objektart</ogc:PropertyName>
                    <ogc:Literal>AX_Landschaft</ogc:Literal>
                  </ogc:PropertyIsEqualTo>
                  <ogc:PropertyIsEqualTo matchCase="true">
                    <ogc:PropertyName>gn:hatObjektart/gn:Objektart/gn:objektart</ogc:PropertyName>
                    <ogc:Literal>AX_StehendesGewaesser</ogc:Literal>
                  </ogc:PropertyIsEqualTo>
                  <ogc:PropertyIsEqualTo matchCase="true">
                    <ogc:PropertyName>gn:hatObjektart/gn:Objektart/gn:objektart</ogc:PropertyName>
                    <ogc:Literal>AX_Meer</ogc:Literal>
                  </ogc:PropertyIsEqualTo>
                  <ogc:PropertyIsEqualTo matchCase="true">
                    <ogc:PropertyName>gn:hatObjektart/gn:Objektart/gn:objektart</ogc:PropertyName>
                    <ogc:Literal>AX_Insel</ogc:Literal>
                  </ogc:PropertyIsEqualTo>
                  <ogc:PropertyIsEqualTo matchCase="true">
                    <ogc:PropertyName>gn:hatObjektart/gn:Objektart/gn:objektart</ogc:PropertyName>
                    <ogc:Literal>AX_SchutzgebietNachNaturUmweltOderBodenschutzrecht</ogc:Literal>
                  </ogc:PropertyIsEqualTo>
                </ogc:Or>
              </ogc:And>
            </ogc:Filter>
          </wfs:Query>
        </wfs:GetFeature>""".trimIndent()

    override fun search(term: String, options: GeoThesaurusSearchOptions): List<SpatialResponse> {
        if (term.isEmpty()) return emptyList()

        val encodedTerm = URLEncoder.encode(term, "utf-8")

//        val type = convertType(options.searchType)
        val response = sendRequest("POST", searchUrlTemplate, template(term))
        val mapper = XmlMapper(JacksonXmlModule())
        return mapper.readTree(response).get("Description")
            .mapNotNull { mapToSpatial(it) }
            .toSet().toList()
    }

    private fun mapToSpatial(it: JsonNode): SpatialResponse? {
        return SpatialResponse("","")
    }

    /*private fun convertType(searchType: ThesaurusSearchType): String {
        return when (searchType) {
            ThesaurusSearchType.EXACT -> "exact"
            ThesaurusSearchType.BEGINS_WITH -> "begins_with"
            ThesaurusSearchType.ENDS_WITH -> "ends_with"
            ThesaurusSearchType.CONTAINS -> "contains"
        }
    }*/
}
