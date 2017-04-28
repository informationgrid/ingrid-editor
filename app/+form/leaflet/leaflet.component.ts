import {
  AfterViewInit, OnDestroy, Component, ElementRef, Input, ViewChild, forwardRef,
  ViewEncapsulation, ChangeDetectorRef
} from '@angular/core';
import {Map} from 'leaflet';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {ModalService} from '../../services/modal/modal.service';
import {NominatimService} from './nominatim.service';
import LatLngBounds = L.LatLngBounds;
import LatLngExpression = L.LatLngExpression;

import '../../../assets/leaflet/leaflet-areaselect';

export const LEAFLET_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => LeafletComponent),
  multi: true
};


@Component({
  selector: 'leaflet',
  template: `
    <div #leaflet title="Zum Verändern des Ausschnitts, müssen Sie den Bearbeiten-Knopf drücken."></div>
    <!--<div class="fieldContainer half">
        Latitude: <input type="text" class="form-control" [(ngModel)]="_bbox.lat" (change)="handleChange()">
    </div><div class="fieldContainer half"> &lt;!&ndash; white space between divs would create an unwanted gap!!! &ndash;&gt;
        Longitude: <input type="text" class="form-control" [(ngModel)]="_bbox.lon" (change)="handleChange()">
    </div>-->
    <div class="full">
        <button type="button" title="Bearbeiten" [class.active]="mapEditing" class="btn btn-default glyphicon glyphicon-edit pull-left" (click)="toggleMap()"></button>
        <button type="button" title="Suchen" [class.active]="showSearch" class="btn btn-default glyphicon glyphicon-search pull-right" (click)="showSearch = !showSearch"></button>
        <div class="text-muted text-center">
            <small *ngIf="drawnBBox">
                Latitude: {{_bbox.lat1 | number:'1.0-4'}} - {{_bbox.lat2 | number:'1.0-4'}}
                <br>
                Longitude: {{_bbox.lon1 | number:'1.0-4'}} - {{_bbox.lon2 | number:'1.0-4'}}
            </small>
            <small *ngIf="!drawnBBox">
                Nichts ausgewählt
            </small>
        </div>
        <div *ngIf="showSearch" class="nominatimContainer">
            <input #locationQuery type="text" class="form-control" (keyup)="searchLocation(locationQuery.value)">
            <select #locationResult name="nominatimResult" multiple (change)="showBoundingBox(locationResult.value)">
                <option *ngFor="let entry of nominatimResult" [value]="entry.boundingbox">{{entry.display_name}}</option>
            </select>
        </div>
    </div>
  `,
  styles: [`
    :host { position: relative; }
    .nominatimContainer {
      position: absolute;
      top: 0;
      left: -420px;
      bottom: 0;
      right: 10px;
      background-color: #eee;
      padding: 10px;
      box-shadow: 0px 0px 20px -5px #000;
    }
    /deep/ .leaflet-areaselect-shade {
      position: absolute;
      background: rgba(0,0,0, 0.4);
    }
    /deep/ .leaflet-areaselect-handle {
      position: absolute;
      background: #fff;
      border: 1px solid #666;
      -moz-box-shadow: 1px 1px rgba(0,0,0, 0.2);
      -webkit-box-shadow: 1px 1px rgba(0,0,0, 0.2);
      box-shadow: 1px 1px rgba(0,0,0, 0.2);
      width: 14px;
      height: 14px;
      cursor: move;
    }
  `],
  providers: [LEAFLET_CONTROL_VALUE_ACCESSOR]
})
export class LeafletComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {

  @ViewChild('leaflet') leaflet: ElementRef;
  private leafletReference: L.Map;
  private areaSelect: any;
  private drawnBBox: any;

  @Input() options: Map.MapOptions;
  @Input() height: number;

  private _onChangeCallback: (x: any) => void;
  private _bbox: any = {};
  private mapEditing: boolean = false;
  private showSearch: boolean = false;

  private nominatimResult: any = [];


  constructor(private modalService: ModalService, private nominatimService: NominatimService,
              private _changeDetectionRef: ChangeDetectorRef) {
  }

  ngAfterViewInit() {
    this.leaflet.nativeElement.style.height = this.height + 'px';
    this.leaflet.nativeElement.style.width = '100%';

    this.leafletReference = L.map(this.leaflet.nativeElement, this.options);
    this.toggleMap(true);
    // this.leafletReference._onResize();

    /*this.leafletReference.on('moveend', () => {
      // if data was set from outside, then ignore update
      if (this.outsideSetData) return;

      this.handleChange(false);
    });*/

    if (this._bbox) {
      this.drawBoxAndZoomToBounds();
      // we need to handle change detection here since object changed meanwhile
      this._changeDetectionRef.detectChanges();
    } else {
      this.zoomToInitialBox();
    }
  }

  get bbox(): any {
    return this._bbox;
  }

  writeValue(value: any): void {
    this.removeDrawnBoundingBox();
    this.drawnBBox = null;

    this._bbox = value ? value : null;
    if (this.leafletReference) {
      if (this._bbox) {
        this.drawBoxAndZoomToBounds();
      } else {
        this.zoomToInitialBox();
      }
    }
  }

  private zoomToInitialBox() {
    let initialBox = {
      lat1: 46.9203,
      lon1: 5.625,
      lat2: 56.3653,
      lon2: 15.9961
    };
    let box = this.getLatLngBoundsFromBox(initialBox);
    this.leafletReference.fitBounds(box, {maxZoom: 12});
  }

  private drawBoxAndZoomToBounds() {
    try {
      let box = this.getLatLngBoundsFromBox( this._bbox );
      this.drawBoundingBox( box );
      this.leafletReference.fitBounds( box, {maxZoom: 12} );
    } catch (ex) {
      console.error('Problem drawing bounding box', ex);
      this._bbox = null;
      this.zoomToInitialBox();
    }
  }

  registerOnChange(fn: any): void {
    this._onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
  }

  handleChange(setView?: boolean) {
    if (setView) {
      // this.leafletReference.setView(new LatLng(this.bbox.lat, this.bbox.lon));
      this.leafletReference.fitBounds(
        new LatLngBounds([this._bbox.lat1, this._bbox.lon1], [this._bbox.lat2, this._bbox.lon2]),
        {maxZoom: 12});
    }
    this._onChangeCallback(this._bbox);
  }

  searchLocation(query: string) {
    this.nominatimService.search(query).subscribe((response: any) => {
      this.nominatimResult = response;
      console.log( 'Nominatim:', response );
    });
  }

  showBoundingBox(box: any) {
    let coords = box.split(',');
    console.log(box);
    this._bbox = {
      lat1: coords[0],
      lon1: coords[2],
      lat2: coords[1],
      lon2: coords[3]
    };
    this.drawBoxAndZoomToBounds();
    this.handleChange(false);
  }

  toggleMap(forceDisable?: boolean) {
    let enabled = forceDisable ? true : this.leafletReference.dragging.enabled();
    if (enabled) {
      this.leafletReference.dragging.disable();
      this.leafletReference.scrollWheelZoom.disable();
      this.leafletReference.doubleClickZoom.disable();
      this.leafletReference.touchZoom.disable();
      // setup area select box
      this.applyAreaSelect();

      this.mapEditing = false;
    } else {
      this.leafletReference.dragging.enable();
      this.leafletReference.scrollWheelZoom.enable();
      this.leafletReference.doubleClickZoom.enable();
      this.leafletReference.touchZoom.enable();
      // setup area select box
      this.setupAreaSelect();

      this.mapEditing = true;
    }
  }

  /**
   * Destroy the map to handle the view cache functionality of ng2.After the first init the leaflet is already initialised.
   * See also:
   * https://github.com/angular/angular/issues/4478
   * https://github.com/angular/angular/issues/1618
   */
  public ngOnDestroy(): void {
    if (this.leafletReference.remove) this.leafletReference.remove();
    if (this.leaflet.nativeElement.remove) this.leaflet.nativeElement.remove();
  }

  private setupAreaSelect() {
    let box = this.drawnBBox ? this.drawnBBox._path.getBBox() : null;
    if (box) {
      this.areaSelect = L.areaSelect({width: box.width, height: box.height});
    } else {
      this.areaSelect = L.areaSelect({width: 50, height: 50});
    }
    this.areaSelect.addTo(this.leafletReference);
  }

  private applyAreaSelect() {
    if (this.areaSelect) {
      let bounds = this.areaSelect.getBounds();
      this.areaSelect.remove();
      this.drawBoundingBox(bounds);
      this._bbox = {
        lat1: bounds.getSouthWest().lat,
        lon1: bounds.getSouthWest().lng,
        lat2: bounds.getNorthEast().lat,
        lon2: bounds.getNorthEast().lng
      };
      this.handleChange(false);
    }
  }

  private drawBoundingBox(latLonBounds: LatLngBounds) {
    this.removeDrawnBoundingBox();
    this.drawnBBox = L.rectangle(latLonBounds, {color: "#ff7800", weight: 1}).addTo(this.leafletReference);
  }

  private removeDrawnBoundingBox() {
    if (this.drawnBBox) this.leafletReference.removeLayer( this.drawnBBox );
  }

  private getLatLngBoundsFromBox(bbox): LatLngBounds {
    return new LatLngBounds([bbox.lat1, bbox.lon1], [bbox.lat2, bbox.lon2]);
  }
}
