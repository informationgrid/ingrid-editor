import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FieldType} from '@ngx-formly/material';
import {LatLngBounds, Map, MapOptions, Rectangle, TileLayer} from 'leaflet';
import {ModalService} from '../../services/modal/modal.service';
import {NominatimService} from '../../+form/leaflet/nominatim.service';
import {LeafletAreaSelect} from '../../+form/leaflet/leaflet-area-select';

class MyMap extends Map {
  _onResize: () => {};
}

@Component({
  selector: 'ige-formly--type',
  template: `
    <div #leaflet title="Zum Verändern des Ausschnitts, müssen Sie den Bearbeiten-Knopf drücken."></div>
    <!--<div class="fieldContainer half">
        Latitude: <input type="text" class="form-control" [(ngModel)]="_bbox.lat" (change)="handleChange()">
    </div><div class="fieldContainer half"> &lt;!&ndash; white space between divs would create an unwanted gap!!! &ndash;&gt;
        Longitude: <input type="text" class="form-control" [(ngModel)]="_bbox.lon" (change)="handleChange()">
    </div>-->
    <div class="full">
      <button *ngIf="!showSearch" mat-icon-button title="Bearbeiten"
              class="pull-left"
              (click)="toggleSearch(true)">
        <mat-icon>edit</mat-icon>
      </button>
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
        <mat-form-field>
          <input matInput #locationQuery type="text" class="form-control" (keyup)="searchLocation(locationQuery.value)"
                 [igeFocus]="showSearch">
        </mat-form-field>
        <mat-selection-list dense (selectionChange)="handleSelection($event)">
          <ng-container *ngFor="let entry of nominatimResult">
            <mat-list-option value="entry.boundingbox" (click)="showBoundingBox(entry.boundingbox)">
              <p matLine>{{entry.display_name}}</p>
            </mat-list-option>
            <mat-divider></mat-divider>
          </ng-container>
        </mat-selection-list>
        <!--<select #locationResult name="nominatimResult" multiple (change)="showBoundingBox(locationResult.value)">-->
        <!--<option *ngFor="let entry of nominatimResult" [value]="entry.boundingbox">{{entry.display_name}}</option>-->
        <!--</select>-->
        <div class="bottom">
          <button mat-button class="pull-left" (click)="cancelEdit()">Abbrechen</button>
          <button mat-button class="pull-right" (click)="applyEdit()">Übernehmen</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
      :host {
          position: relative;
          display: block;
      }

      .bottom {
          display: block;
      }

      mat-selection-list {
          flex-grow: 1;
          margin: 10px 0;
          overflow: auto;
      }

      /*.mat-list .mat-list-item {*/
      /*font-size: 14px;*/
      /*}*/

      .nominatimContainer {
          position: absolute;
          width: 350px;
          top: 0;
          bottom: 0;
          right: calc(100% + 10px);
          background-color: #fff;
          padding: 10px;
          box-shadow: 0px 0px 20px -5px #000;
          display: flex;
          flex-direction: column;
      }

      /deep/
      .leaflet-areaselect-shade {
          position: absolute;
          background: rgba(0, 0, 0, 0.4);
      }

      /deep/
      .leaflet-areaselect-handle {
          position: absolute;
          background: #fff;
          border: 1px solid #666;
          -moz-box-shadow: 1px 1px rgba(0, 0, 0, 0.2);
          -webkit-box-shadow: 1px 1px rgba(0, 0, 0, 0.2);
          box-shadow: 1px 1px rgba(0, 0, 0, 0.2);
          width: 14px;
          height: 14px;
          cursor: move;
      }
  `]
})
export class LeafletTypeComponent extends FieldType implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('leaflet', {static: true}) leaflet: ElementRef;
  private leafletReference: L.Map;
  private areaSelect: any;
  drawnBBox: any;

  // @Input() mapOptions: MapOptions;
  // @Input() height: number;

  private _onChangeCallback: (x: any) => void;

  _bbox: any = {};
  private _bboxPrevious: any;

  showSearch = false;

  nominatimResult: any = [];

  private static getLatLngBoundsFromBox(bbox: any): LatLngBounds {
    return new LatLngBounds([bbox.lat1, bbox.lon1], [bbox.lat2, bbox.lon2]);
  }

  constructor(private modalService: ModalService, private nominatimService: NominatimService,
              private _changeDetectionRef: ChangeDetectorRef) {
    super();
  }

  ngAfterViewInit() {
    this.leaflet.nativeElement.style.height = this.to.height + 'px';
    this.leaflet.nativeElement.style.width = '100%';

    try {
      this.to.mapOptions.layers = [new TileLayer(
        '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        })];
      this.leafletReference = new Map(this.leaflet.nativeElement, this.to.mapOptions);
    } catch (e) {
      console.error('Problem initializing the map component.', e);
      this.modalService.showJavascriptError('Problem initializing the map component.', e);
      return;
    }
    this.toggleSearch(false);
    (<MyMap>this.leafletReference)._onResize();

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

  handleSelection(event) {
    if (event.option.selected) {
      event.source.deselectAll();
      event.option._setSelected(true);
    }
  }

  private zoomToInitialBox(): Map {
    const initialBox = {
      lat1: 46.9203,
      lon1: 5.625,
      lat2: 56.3653,
      lon2: 15.9961
    };
    const box = LeafletTypeComponent.getLatLngBoundsFromBox(initialBox);
    return this.leafletReference.fitBounds(box, {maxZoom: 13});
  }

  private drawBoxAndZoomToBounds(): Map {
    try {
      const box = LeafletTypeComponent.getLatLngBoundsFromBox(this._bbox);
      this.drawBoundingBox(box);
      return this.leafletReference.fitBounds(box, {maxZoom: 13});
    } catch (ex) {
      console.error('Problem drawing bounding box', ex);
      this._bbox = null;
      return this.zoomToInitialBox();
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
        {maxZoom: 13});
    }
    this._onChangeCallback(this._bbox);
  }

  searchLocation(query: string) {
    this.nominatimService.search(query).subscribe((response: any) => {
      this.nominatimResult = response;
      console.log('Nominatim:', response);
    });
  }

  showBoundingBox(coords: string[]) {
    this._bbox = {
      lat1: coords[0],
      lon1: coords[2],
      lat2: coords[1],
      lon2: coords[3]
    };
    // this.drawBoxAndZoomToBounds();
    // this.handleChange(false);
    // let latLonBounds = this.getLatLngBoundsFromBox(bbox);
    this.setAreaSelect();
  }

  toggleSearch(forceShow?: boolean) {
    // toggle status variable or use override value
    this.showSearch = (forceShow === undefined) ? !this.showSearch : forceShow;

    // let disableEditing = forceDisable ? true : !this.leafletReference.dragging.enabled();
    if (this.showSearch) {
      this.leafletReference.dragging.enable();
      this.leafletReference.scrollWheelZoom.enable();
      this.leafletReference.doubleClickZoom.enable();
      this.leafletReference.touchZoom.enable();
      // setup area select box
      this.setupAreaSelect();
      this._bboxPrevious = this._bbox;
      this.nominatimResult = [];

    } else {
      this.leafletReference.dragging.disable();
      this.leafletReference.scrollWheelZoom.disable();
      this.leafletReference.doubleClickZoom.disable();
      this.leafletReference.touchZoom.disable();
      // setup area select box
      // this.applyAreaSelect();
    }
  }

  /**
   * Destroy the map to handle the view cache functionality of ng2.After the first init the leaflet is already initialised.
   * See also:
   * https://github.com/angular/angular/issues/4478
   * https://github.com/angular/angular/issues/1618
   */
  public ngOnDestroy(): void {
    if (this.leafletReference.remove) {
      this.leafletReference.remove();
    }
    if (this.leaflet.nativeElement.remove) {
      this.leaflet.nativeElement.remove();
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
    setTimeout(() => {
      updateAreaSelect();
    }, 270);
  }

  applyAreaSelect() {
    if (this.areaSelect) {
      const bounds = this.areaSelect.getBounds();
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
    this.drawnBBox = new Rectangle(latLonBounds, {color: '#ff7800', weight: 1}).addTo(this.leafletReference);
  }

  private removeDrawnBoundingBox() {
    if (this.drawnBBox) {
      this.leafletReference.removeLayer(this.drawnBBox);
    }
  }

  cancelEdit() {
    this.showSearch = false;
    this._bbox = this._bboxPrevious;
    this.areaSelect.remove();
    this.drawBoxAndZoomToBounds();
    this.toggleSearch(false);
  }

  applyEdit() {
    this.showSearch = false;
    this.applyAreaSelect();
    this.toggleSearch(false);
  }
}
