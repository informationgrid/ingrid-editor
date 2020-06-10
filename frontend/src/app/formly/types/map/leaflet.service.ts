import {Injectable} from '@angular/core';
import {LatLngBounds, Map, MapOptions, Rectangle, TileLayer} from 'leaflet';
import {SpatialLocationWithColor} from './spatial-list/spatial-list.component';
import {WktTools} from './spatial-dialog/wkt-spatial/wkt-tools';

@Injectable({
  providedIn: 'root'
})
export class LeafletService {
  static optionsNonInteractive: MapOptions = {
    zoomControl: false,
    dragging: false,
    boxZoom: false,
    scrollWheelZoom: false,
    keyboard: false
  }

  private defaultOptions: MapOptions = {};

  private colors = ['#ff7800', '#88ff00', '#00ccff', '#7700ff', '#ff0008'];
  private wktTools: WktTools;

  static getLatLngBoundsFromBox(bbox: any): LatLngBounds {
    if (!bbox) {
      return null;
    }

    return new LatLngBounds([bbox.lat1, bbox.lon1], [bbox.lat2, bbox.lon2]);
  }

  private defaultLayer = () => new TileLayer(
    '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    });

  constructor() {
    this.wktTools = new WktTools();
  }

  zoomToInitialBox(map: Map): Map {
    const initialBox = {
      lat1: 46.9203,
      lon1: 5.625,
      lat2: 56.3653,
      lon2: 15.9961
    };
    const box = LeafletService.getLatLngBoundsFromBox(initialBox);
    return box ? map.fitBounds(box, {maxZoom: 13}) : map;
  }

  initMap(mapElement: any, matOptions: MapOptions) {

    const defaults = {...this.defaultOptions};
    return new Map(mapElement, {
      layers: [this.defaultLayer()],
      ...defaults, ...matOptions
    });
  }

  drawSpatialRefs(map: Map, locations: SpatialLocationWithColor[]): Rectangle[] {

    let bounds: LatLngBounds = null;

    const drawnBoxes = locations
      .map(location => ({box: LeafletService.getLatLngBoundsFromBox(location.value), color: location.color}))
      .map((location, index) => {
        bounds = this.extendBounds(bounds, location.box);
        return this.drawBoundingBox(map, location.box, location.color);
      });

    map.fitBounds(bounds, {maxZoom: 18});

    return drawnBoxes;

  }

  getColor(index: number): string {
    return this.colors[index];
  }

  private drawBoundingBox(map: Map, latLonBounds: LatLngBounds, color: string): Rectangle {
    return new Rectangle(latLonBounds, {color: color, weight: 1}).addTo(map);
  }

  removeDrawnBoundingBoxes(map: Map, boxes: Rectangle[]) {
    boxes.forEach(box => setTimeout(() => map.removeLayer(box), 100));
  }

  /*highlightLayer(map: Map, location: SpatialLocationWithColor): Rectangle {

    const hightlightArea = this.drawSpatialRefs(map, [location]);
    // hightlightArea[0].setStyle(this.hightlightColor);
    return hightlightArea[0];

  }*/

  zoomToLayer(map: Map, location: SpatialLocationWithColor) {
    map.fitBounds(LeafletService.getLatLngBoundsFromBox(location.value));
  }

  convertWKT(map: Map, wkt: string) {
    return this.wktTools.mapIt(map, wkt);
  }

  private extendBounds(bounds: LatLngBounds, box: LatLngBounds): LatLngBounds {
    const boxBounds = bounds ? new LatLngBounds(bounds.getSouthWest(), bounds.getNorthEast()) : null;
    if (!boxBounds) {
      return box;
    } else {
      return boxBounds.extend(box);
    }
  }
}
