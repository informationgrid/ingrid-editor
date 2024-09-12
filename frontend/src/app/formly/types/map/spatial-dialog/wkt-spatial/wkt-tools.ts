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
import { geoJson, Map } from "leaflet";
import { IgeError } from "../../../../../models/ige-error";
import { wktToGeoJSON } from "@terraformer/wkt"; // GeoJSON types

export class WktTools {
  private defaultConfig = {
    color: "#AA0000",
    editable: true,
    fillColor: "#AA0000",
    fillOpacity: 0.2,
    opacity: 1,
    weight: 3,
  };

  /**
   * Maps the current contents of the textarea.
   * @param map
   * @param wktString
   * @param overrideConfig
   * @param   editable    {Boolean}   Indicates that the feature drawn should be editable
   * @param   focus       {Boolean}   Indicates that the map should pan and/or zoom to new features
   * @return              {Object}    Some sort of geometry object
   */
  mapIt(
    map: Map,
    wktString: string,
    overrideConfig = {},
    editable: boolean = false,
    focus: boolean = true,
  ): object {
    let geom = this.readWKTString(wktString);

    const config: any = {
      ...this.defaultConfig,
      ...overrideConfig,
      editable: editable,
    };

    // const json = this.writer.write(geom);
    const geoJsonResult = geoJson(geom, config);
    geoJsonResult.addTo(map);

    // Pan the map to the feature
    if (focus) {
      map.fitBounds(geoJsonResult.getBounds());
    }

    return geoJsonResult;
  }

  private readWKTString(wktString: string) {
    try {
      // Catch any malformed WKT strings
      return wktToGeoJSON(wktString);
    } catch (e1) {
      try {
        return wktToGeoJSON(
          wktString.replace("\n", "").replace("\r", "").replace("\t", ""),
        );
      } catch (e2) {
        if (e2.name === "WKTError") {
          throw new IgeError(
            "We could not understand the WKT string you entered. Check that you have parentheses " +
              "balanced, and try removing tabs and newline characters.",
          );
        }
      }
    }
  }
}
