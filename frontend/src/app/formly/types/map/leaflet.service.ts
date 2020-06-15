import {Injectable} from '@angular/core';
import {
  LatLng,
  LatLngBounds,
  LatLngBoundsExpression,
  LatLngExpression,
  Layer,
  Map,
  MapOptions,
  Marker,
  Rectangle,
  TileLayer
} from 'leaflet';
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

  private colors = ['#4499CC', '#35922C', '#FFBC00', '#FF7500', '#DE2525', '#DE2525', '#2C4EB7'];
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

    let bounds: LatLngBoundsExpression;

    const wktLocations = locations.filter(location => location.type === 'wkt');
    const boxLocations = locations.filter(location => location.type === 'free');

    const drawnWktLocations = this.drawWktLocations(map, wktLocations);
    const drawnBoxLocations = this.drawBoxLocations(map, boxLocations);

    // fix order of drawn layers since we use them for selection and more
    const drawnBoxes = [];
    wktLocations.forEach((location, index) => drawnBoxes[location.indexNumber] = drawnWktLocations[index])
    boxLocations.forEach((location, index) => drawnBoxes[location.indexNumber] = drawnBoxLocations[index])

    bounds = this.getBoundingBoxFromLayers(drawnBoxes);

    if (bounds) {
      map.fitBounds(bounds, {maxZoom: 18});
    }

    return drawnBoxes;

  }

  getColor(index: number): string {
    return this.colors[index];
  }

  private drawBoundingBox(map: Map, latLonBounds: LatLngBounds, color: string): Rectangle {

    if (!latLonBounds) {
      return null;
    }
    return new Rectangle(latLonBounds, {color: color, weight: 1}).addTo(map);

  }

  removeDrawnBoundingBoxes(map: Map, boxes: Rectangle[]) {
    boxes.forEach(box => setTimeout(() => map.removeLayer(box), 100));
  }

  convertWKT(map: Map, wkt: string, focus = false) {
    return this.wktTools.mapIt(map, wkt, false, focus);
  }

  private extendBounds(bounds: LatLngBounds, box: LatLngExpression | LatLngBoundsExpression): LatLngBounds {

    const boxBounds = bounds ? new LatLngBounds(bounds.getSouthWest(), bounds.getNorthEast()) : null;
    if (!boxBounds) {
      if (box instanceof LatLng) {
        return new LatLngBounds(box, box);
      }
      return <LatLngBounds>box;
    } else {
      return boxBounds.extend(box);
    }

  }

  private drawBoxLocations(map: Map, locations: SpatialLocationWithColor[]) {


    return locations
      .map(location => ({box: LeafletService.getLatLngBoundsFromBox(location.value), color: location.color}))
      .map(location => {
        return this.drawBoundingBox(map, location.box, location.color);
      });

  }

  private drawWktLocations(map: Map, locations: SpatialLocationWithColor[]) {

    return locations
      .map(location => this.wktTools.mapIt(map, <string>location.value, false, false));

  }

  getBoundingBoxFromLayers(layers: Layer[]): LatLngBoundsExpression {

    let bounds: LatLngBounds = null;

    layers.forEach(layer => {
      if ((<Rectangle>layer).getBounds) {
        bounds = this.extendBounds(bounds, (<Rectangle>layer).getBounds())
      } else if ((<Marker>layer).getLatLng) {
        bounds = this.extendBounds(bounds, (<Marker>layer).getLatLng())
      }
    });
    return bounds;

  }
}
