import {Injectable} from '@angular/core';
import {LatLngBounds, Map, MapOptions, Rectangle, TileLayer} from 'leaflet';
import {MatOption} from '@angular/material/core';
import {SpatialLocation, SpatialLocationWithColor} from './spatial-list/spatial-list.component';

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

  drawSpatialRefs(map: Map, locations: SpatialLocationWithColor[]) {

    let bounds: LatLngBounds = null;

    const drawnBoxes = locations
      .map(location => LeafletService.getLatLngBoundsFromBox(location.box))
      .map((box, index) => {
        bounds = this.extendBounds(bounds, box);
        return this.drawBoundingBox(map, box, this.colors[index]);
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

  private extendBounds(bounds: LatLngBounds, box: LatLngBounds): LatLngBounds {
    const boxBounds = bounds ? new LatLngBounds(bounds.getSouthWest(), bounds.getNorthEast()) : null;
    if (!boxBounds) {
      return box;
    } else {
      return boxBounds.extend(box);
    }
  }
}
