import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {LatLngBounds, Map, Rectangle} from 'leaflet';
import {LeafletAreaSelect} from '../leaflet-area-select';
import {UntilDestroy} from '@ngneat/until-destroy';
import {LeafletService} from '../leaflet.service';
import {MatDialogRef} from '@angular/material/dialog';
import {SpatialLocation} from '../spatial-list/spatial-list.component';
import {SpatialResult} from './spatial-result.model';

class MyMap extends Map {
  _onResize: () => {};
}

@UntilDestroy()
@Component({
  selector: 'ige-spatial-dialog',
  templateUrl: './spatial-dialog.component.html',
  styleUrls: ['./spatial-dialog.component.scss']
})
export class SpatialDialogComponent implements OnInit, AfterViewInit {

  @ViewChild('leafletDlg') leaflet: ElementRef;
  private leafletReference: L.Map;

  private areaSelect: LeafletAreaSelect = null;
  drawnBBox: any;
  _bbox: any = null;
  types = [
    {id: 'free', label: 'Freier Raumbezug'},
    {id: 'wkt', label: 'WKT'},
    {id: 'draw', label: 'Auf Karte zeichnen'},
    {id: 'geo-name', label: 'Geografischer Name'}
  ];
  view = 'free';
  private _name: string;

  get bbox(): any {
    return this._bbox;
  }

  constructor(private dialogRef: MatDialogRef<SpatialDialogComponent>,
              private leafletService: LeafletService) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {


    this.leaflet.nativeElement.style.height = 'auto';
    this.leaflet.nativeElement.style.minHeight = 'calc(100vh - 235px)';
    this.leaflet.nativeElement.style.width = '100%';
    this.leaflet.nativeElement.style.minWidth = '400px';
    // const options: MapOptions = this.to.mapOptions;
    this.leafletReference = this.leafletService.initMap(this.leaflet.nativeElement, {});
    this.leafletService.zoomToInitialBox(this.leafletReference);

    this.setupAreaSelect();
  }


  setAndShowBoundingBox(result: SpatialResult) {
    this._name = result.title;
    this._bbox = {
      lat1: result.box[0],
      lon1: result.box[2],
      lat2: result.box[1],
      lon2: result.box[3]
    };
    this.drawBoxAndZoomToBounds();
    this.setAreaSelect();
  }

  private setAreaSelect() {
    const updateAreaSelect = () => {
      if (this.drawnBBox) {
        const box = this.drawnBBox._path.getBBox();
        this.areaSelect.setDimensions(box);
      }
    };
    this.drawBoxAndZoomToBounds().once('zoomend', () => {
      setTimeout(() => updateAreaSelect(), 10);
    });
    setTimeout(() => updateAreaSelect(), 270);
  }

  private drawBoxAndZoomToBounds(): Map {
    try {
      const box = LeafletService.getLatLngBoundsFromBox(this._bbox);
      if (box) {
        this.drawBoundingBox(box);
        return this.leafletReference.fitBounds(box, {maxZoom: 18});
      } else {
        return this.leafletReference;
      }
    } catch (ex) {
      console.error('Problem drawing bounding box', ex);
      this._bbox = null;
      return this.leafletService.zoomToInitialBox(this.leafletReference);
    }
  }

  private setupAreaSelect() {
    const box = this.drawnBBox ? this.drawnBBox._path.getBBox() : null;
    if (box) {
      this.areaSelect = new LeafletAreaSelect(box);
    } else {
      this.areaSelect = new LeafletAreaSelect({width: 50, height: 50});
    }
    this.areaSelect.addTo(this.leafletReference);
  }

  private drawBoundingBox(latLonBounds: LatLngBounds) {
    this.removeDrawnBoundingBox();
    this.drawnBBox = new Rectangle(latLonBounds, {color: '#ff7800', weight: 1}).addTo(this.leafletReference);
  }

  private removeDrawnBoundingBox() {
    if (this.drawnBBox) {
      const bbox = this.drawnBBox;
      setTimeout(() => this.leafletReference.removeLayer(bbox), 100);
      this.drawnBBox = null;
    }
  }

  getSelectedArea() {
    const bounds = this.areaSelect.getBounds();
    this.dialogRef.close(<SpatialLocation>{
      title: this._name || 'N/A',
      type: 'bbox',
      box: {
        lat1: bounds.getSouthWest().lat,
        lon1: bounds.getSouthWest().lng,
        lat2: bounds.getNorthEast().lat,
        lon2: bounds.getNorthEast().lng
      }
    });
  }

  updateView(id: string) {

    this.view = id;
    this.resetMapAddons();
    this.prepareMapForView(id);

  }

  private prepareMapForView(id: string) {

    (<MyMap>this.leafletReference)._onResize();
    switch (id) {
      case 'free':
        return this.setupFreeSpatial();
      case 'wkt':
        return this.setupWktSpatial();
    }
    // setTimeout(() => (<MyMap>this.leafletReference)._onResize(), 100);

  }

  private resetMapAddons() {
    if (this.areaSelect) {
      this.areaSelect.remove();
      this.areaSelect = null;
    }
  }

  private setupFreeSpatial() {
    this.setupAreaSelect();
  }

  private setupWktSpatial() {
  }
}
