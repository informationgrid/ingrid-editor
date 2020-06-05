import {Injectable} from '@angular/core';
import {LatLngBounds, Map, MapOptions, TileLayer} from 'leaflet';
import {MatOption} from '@angular/material/core';

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
}
