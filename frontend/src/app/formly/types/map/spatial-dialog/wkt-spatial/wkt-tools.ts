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
import { Map } from "leaflet";
import Wkt from "wicket";
import Wktleaflet from "wicket/wicket-leaflet";

export class WktTools {
  private defaultConfig = {
    color: "#AA0000",
    editable: true,
    fillColor: "#AA0000",
    fillOpacity: 0.2,
    opacity: 1,
    weight: 3,
  };

  private wkt = new Wkt.Wkt();

  constructor() {
    // use lib so that IDE does not remove import statement above!
    Wktleaflet.name;
  }

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
    try {
      // Catch any malformed WKT strings
      this.wkt.read(wktString);
    } catch (e1) {
      try {
        this.wkt.read(
          wktString.replace("\n", "").replace("\r", "").replace("\t", ""),
        );
      } catch (e2) {
        if (e2.name === "WKTError") {
          alert(
            "Wicket could not understand the WKT string you entered. Check that you have parentheses " +
              "balanced, and try removing tabs and newline characters.",
          );
          return;
        }
      }
    }

    const config = {
      ...this.defaultConfig,
      ...overrideConfig,
      editable: editable,
    };

    const obj = this.wkt.toObject(config); // Make an object

    // Add listeners for overlay editing events
    if (this.wkt.type === "polygon" || this.wkt.type === "linestring") {
    }

    if (Wkt.isArray(obj)) {
      // Distinguish multigeometries (Arrays) from objects
      for (const i in obj) {
        if (obj.hasOwnProperty(i) && !Wkt.isArray(obj[i])) {
          obj[i].addTo(map);
          // this.features.push(obj[i]);
        }
      }
    } else {
      obj.addTo(map); // Add it to the map
      // this.features.push(obj);
    }

    // Pan the map to the feature
    setTimeout(() => {
      if (
        focus &&
        obj.getBounds !== undefined &&
        typeof obj.getBounds === "function"
      ) {
        // For objects that have defined bounds or a way to get them
        map.fitBounds(obj.getBounds());
      } else {
        if (
          focus &&
          obj.getLatLng !== undefined &&
          typeof obj.getLatLng === "function"
        ) {
          map.panTo(obj.getLatLng());
        }
      }
    });

    return obj;
  }
}
