/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
import { inject, Injectable } from "@angular/core";
import {
  GeoJSON,
  icon,
  LatLng,
  LatLngBounds,
  LatLngBoundsExpression,
  LatLngExpression,
  Layer,
  Map,
  MapOptions,
  Marker,
  Polyline,
  Rectangle,
  TileLayer,
} from "leaflet";
import {
  SpatialLocation,
  SpatialLocationWithColor,
} from "./spatial-list/spatial-list.component";
import { WktTools } from "./spatial-dialog/wkt-spatial/wkt-tools";
import {
  ConfigService,
  Configuration,
} from "../../../services/config/config.service";
import { HttpClient } from "@angular/common/http";
import {
  BwastrLocatorCoordinatesResponse,
  BwastrLocatorService,
} from "./spatial-dialog/bwastr-spatial/bwastr-locator.service";
import { forkJoin, Observable, of } from "rxjs";
import { catchError, finalize, map, tap } from "rxjs/operators";

export interface WktValidateResponse {
  isValid: boolean;
  message: string;
}

@Injectable({
  providedIn: "root",
})
export class LeafletService {
  private bwastrLocatorService = inject(BwastrLocatorService);
  private config = inject(ConfigService);
  private http = inject(HttpClient);

  private defaultOptions: MapOptions = {};

  private colors = [
    "#4499CC",
    "#35922C",
    "#FFBC00",
    "#FF7500",
    "#DE2525",
    "#b711c2",
    "#2C4EB7",
    "#0a5383",
    "#55d04a",
    "#ad8009",
    "#bd5600",
    "#bd0202",
    "#8d0094",
    "#10c790",
    "#8f7fd5",
    "#efc59f",
    "#ef9494",
    "#ea86ef",
    "#9ff3d9",
  ];
  private wktTools: WktTools;
  private configuration: Configuration;

  static getLatLngBoundsFromBox(bbox: any): LatLngBounds {
    if (!bbox) {
      return null;
    }

    return new LatLngBounds([bbox.lat1, bbox.lon1], [bbox.lat2, bbox.lon2]);
  }

  private defaultLayer = () => {
    let conf = this.config.getConfiguration();
    if (conf.mapWMSUrl?.length > 0 && conf.mapWMSLayers?.length > 0) {
      return new TileLayer.WMS(conf.mapWMSUrl, {
        layers: conf.mapWMSLayers,
        attribution: conf.mapAttribution,
      });
    } else {
      return new TileLayer(conf.mapTileUrl, {
        attribution: conf.mapAttribution,
      });
    }
  };

  constructor() {
    this.configuration = this.config.getConfiguration();
    this.wktTools = new WktTools();

    // fix for marker-icon location
    const iconRetinaUrl = "assets/marker-icon-2x.png";
    const iconUrl = "assets/marker-icon.png";
    const shadowUrl = "assets/marker-shadow.png";
    Marker.prototype.options.icon = icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41],
    });
  }

  zoomToInitialBox(map: Map): Map {
    const initialBox = {
      lat1: 46.9203,
      lon1: 5.625,
      lat2: 56.3653,
      lon2: 15.9961,
    };
    const box = LeafletService.getLatLngBoundsFromBox(initialBox);
    return box ? map.fitBounds(box, { maxZoom: 13 }) : map;
  }

  initMap(mapElement: any, mapOptions: MapOptions) {
    const defaults = { ...this.defaultOptions };
    let map = new Map(mapElement, {
      layers: [this.defaultLayer()],
      ...defaults,
      ...mapOptions,
    });
    map.attributionControl.setPrefix(false);
    return map;
  }

  drawSpatialRefs(
    mapRef: Map,
    locations: SpatialLocationWithColor[],
  ): Observable<(Polyline<any> | GeoJSON)[]> {
    if (locations.length === 0) return of([]);

    const drawnBoxes: (Polyline<any> | GeoJSON)[] = [];
    let isComplete = false;

    const drawingObservables = locations.map((location) =>
      this.drawSingleLocation(mapRef, location).pipe(
        tap((geometry) => (drawnBoxes[location.indexNumber] = geometry)),
      ),
    );

    return forkJoin(drawingObservables).pipe(
      tap(() => {
        this.finalizeDrawing(mapRef, drawnBoxes);
        isComplete = true;
      }),
      map(() => drawnBoxes),
      finalize(() => {
        if (!isComplete) {
          this.removeDrawnBoundingBoxes(mapRef, drawnBoxes);
        }
      }),
    );
  }

  private drawSingleLocation(
    map: Map,
    location: SpatialLocationWithColor,
  ): Observable<Polyline | GeoJSON | Rectangle | null> {
    if (location.type === "wkt" && location.wkt) {
      return of(this.drawWktLocation(map, location));
    }
    if (
      (location.type === "free" && location.value) ||
      location.type === "wfsgnde"
    ) {
      return of(this.drawBoxLocation(map, location));
    }
    if (location.type === "bwastr") {
      return this.drawBwastrLocation(map, location);
    }
    return of(null);
  }

  private finalizeDrawing(map: Map, drawnBoxes: (Polyline<any> | GeoJSON)[]) {
    const bounds = this.getBoundingBoxFromLayers(drawnBoxes);

    if (bounds) {
      map.fitBounds(bounds, { maxZoom: 18 });
    }
  }

  getColor(index: number): string {
    return this.colors[index];
  }

  private drawBoundingBox(
    map: Map,
    latLonBounds: LatLngBounds,
    color: string,
  ): Rectangle {
    if (!latLonBounds) {
      return null;
    }
    return new Rectangle(latLonBounds, { color: color, weight: 1 }).addTo(map);
  }

  removeDrawnBoundingBoxes(map: Map, boxes: (Polyline<any> | GeoJSON)[]) {
    if (!boxes || !map) return;
    boxes.forEach((box) => {
      if (box) {
        map.removeLayer(box);
      }
    });
  }

  convertWKT(map: Map, wkt: string, focus = false) {
    return this.wktTools.mapIt(map, wkt, {}, false, focus);
  }

  private extendBounds(
    bounds: LatLngBounds,
    box: LatLngExpression | LatLngBoundsExpression,
  ): LatLngBounds {
    const boxBounds = bounds
      ? new LatLngBounds(bounds.getSouthWest(), bounds.getNorthEast())
      : null;
    if (!boxBounds) {
      if (box instanceof LatLng) {
        return new LatLngBounds(box, box);
      }
      return <LatLngBounds>box;
    } else {
      return boxBounds.extend(box);
    }
  }

  private drawBoxLocation(
    map: Map,
    location: SpatialLocationWithColor,
  ): Rectangle {
    const box = LeafletService.getLatLngBoundsFromBox(location.value);
    return this.drawBoundingBox(map, box, location.color);
  }

  private drawWktLocation(
    map: Map,
    location: SpatialLocationWithColor,
  ): GeoJSON {
    return this.wktTools.mapIt(
      map,
      location.wkt,
      {
        color: location.color,
        fillColor: location.color + "33",
        fillOpacity: 1,
      },
      false,
      false,
    );
  }

  private drawBwastrLocation(
    mapRef: Map,
    location: SpatialLocationWithColor,
  ): Observable<Polyline> {
    return this.bwastrLocatorService
      .getSectionCoordinates(location.bwastr)
      .pipe(
        catchError(() => {
          return of(null);
        }),
        map((response: BwastrLocatorCoordinatesResponse) => {
          if (!response) {
            console.warn(
              "No coordinates found for section! Check backend logs for more information.",
            );
            return;
          }

          const latLngs = response.coordinates.map((singleLine) =>
            singleLine.map((coord) => new LatLng(coord[1], coord[0])),
          );

          const polyline = new Polyline(latLngs, {
            // always blue to represent water
            color: "blue",
            weight: 3,
          });
          polyline.addTo(mapRef);
          return polyline;
        }),
      );
  }

  getBoundingBoxFromLayers(layers: Layer[]): LatLngBoundsExpression {
    let bounds: LatLngBounds = null;

    layers.forEach((layer) => {
      if (!layer) return;

      if ((<Rectangle>layer).getBounds) {
        bounds = this.extendBounds(bounds, (<Rectangle>layer).getBounds());
      } else if ((<Marker>layer).getLatLng) {
        bounds = this.extendBounds(bounds, (<Marker>layer).getLatLng());
      }
    });
    return bounds;
  }

  extendLocationsWithColor(
    locations: SpatialLocation[],
  ): SpatialLocationWithColor[] {
    return locations.map((location, index) => ({
      ...location,
      indexNumber: index,
      color: this.getColor(index),
    }));
  }

  validateWkt(value: string) {
    return this.http.post<WktValidateResponse>(
      `${this.configuration.backendUrl}tools/validate/wkt`,
      value,
    );
  }

  containsCoordinates(locations: SpatialLocation) {
    return locations.value || locations.wkt || locations.type === "bwastr";
  }
}
