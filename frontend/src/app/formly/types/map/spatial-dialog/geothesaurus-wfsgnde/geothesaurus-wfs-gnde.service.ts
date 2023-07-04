import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ConfigService } from "../../../../../services/config/config.service";

@Injectable({
  providedIn: "root",
})
export class GeothesaurusWfsGndeService {
  private http = inject(HttpClient);

  private templateFn = (query) => `
<wfs:GetFeature traverseXlinkDepth="*" resultType="results" version="1.1.0" service="WFS" xmlns:wfs="http://www.opengis.net/wfs"  xmlns:ogc="http://www.opengis.net/ogc"          >
  <wfs:Query featureVersion="1.1.0" typeName="gn:GnObjekt" >
    <ogc:Filter>
      <ogc:And>
        <ogc:PropertyIsLike wildCard="*" singleChar="?" matchCase="false" escapeChar="\\">
          <ogc:PropertyName>gn:hatEndonym/gn:Endonym/gn:name</ogc:PropertyName>
        <ogc:Literal>*${query}*</ogc:Literal>
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
</wfs:GetFeature>
`;

  constructor() {}

  search(query: string) {
    return this.http.post(
      ConfigService.backendApiUrl + "search/geothesaurus/wfsgnde",
      query
    );
  }
}
