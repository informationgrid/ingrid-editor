import {AfterViewInit, OnDestroy, Component, ElementRef, Input, ViewChild, forwardRef} from '@angular/core';
import {LatLng, Map} from 'leaflet';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {ModalService} from '../../services/modal/modal.service';
import {NominatimService} from './nominatim.service';
import LatLngBounds = L.LatLngBounds;
import LatLngExpression = L.LatLngExpression;


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
            <small>
                Latitude: {{_bbox.lat1 | number:'1.0-4'}} - {{_bbox.lat2 | number:'1.0-4'}}
                <br>
                Longitude: {{_bbox.lon1 | number:'1.0-4'}} - {{_bbox.lon2 | number:'1.0-4'}}
            </small>
        </div>
        <input *ngIf="showSearch" #locationQuery type="text" class="form-control" (keyup)="searchLocation(locationQuery.value)">
        <select *ngIf="showSearch" #locationResult name="nominatimResult" multiple (change)="showBoundingBox(locationResult.value)">
          <option *ngFor="let entry of nominatimResult" [value]="entry.boundingbox">{{entry.display_name}}</option>
        </select>
    </div>
  `,
  styles: [`
    
  `],
  providers: [LEAFLET_CONTROL_VALUE_ACCESSOR]
})
export class LeafletComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {

  @ViewChild('leaflet') leaflet: ElementRef;
  private leafletReference: L.Map;

  @Input() options: Map.MapOptions;
  @Input() height: number;

  private _onChangeCallback: (x: any) => void;
  private _bbox: any = {};
  private mapEditing: boolean = false;
  private showSearch: boolean = false;
  private outsideSetData: boolean = false;

  private nominatimResult: any = [];


  constructor(private modalService: ModalService, private nominatimService: NominatimService) {
  }

  get bbox(): any {
    return this._bbox;
  }

  writeValue(value: any): void {
    if (!value) {
      this._bbox = {
        lat1: 50,
        lon1: 12,
        lat2: 50,
        lon2: 12
      };
    } else {
      this._bbox = value;
    }
    if (this.leafletReference && this.bbox) {
      this.outsideSetData = true;
      // this.leafletReference.setView(new LatLng(this.bbox.lat, this.bbox.lon));
      if (this._bbox.lat1) {
        this.leafletReference.fitBounds(new LatLngBounds([this.bbox.lat1, this.bbox.lon1], [this.bbox.lat2, this.bbox.lon2]));
      }
      this.outsideSetData = false;
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
        new LatLngBounds([this.bbox.lat1, this.bbox.lon1], [this.bbox.lat2, this.bbox.lon2]),
        {maxZoom: 12});
    }
    this._onChangeCallback(this._bbox);
  }

  ngAfterViewInit() {
    this.leaflet.nativeElement.style.height = this.height + 'px';
    this.leaflet.nativeElement.style.width = '100%';

    if (this.bbox.lat1) {
      let bounds = new LatLngBounds([this.bbox.lat1, this.bbox.lon1], [this.bbox.lat2, this.bbox.lon2]);
      this.options.center = bounds.getCenter();
    }
    this.leafletReference = L.map(this.leaflet.nativeElement, this.options);
    this.toggleMap(true);
    // this.leafletReference._onResize();

    this.leafletReference.on('moveend', () => {
      // if data was set from outside, then ignore update
      if (this.outsideSetData) return;

      let bounds = this.leafletReference.getBounds();
      // let center = bounds.getCenter();
      // console.debug( 'bounds:', center );
      this._bbox.lat1 = bounds.getSouthWest().lat;
      this._bbox.lon1 = bounds.getSouthWest().lng;
      this._bbox.lat2 = bounds.getNorthEast().lat;
      this._bbox.lon2 = bounds.getNorthEast().lng;
      this.handleChange(false);
    });
  }

  searchLocation(query: string) {
    // this.modalService.showNotImplemented();
    this.nominatimService.search(query).subscribe((response: any) => {
      this.nominatimResult = response;
      console.log( 'Nominatim:', response );
    });
  }

  showBoundingBox(box: any) {
    let coords = box.split(',');
    console.log(box);
    this._bbox.lat1 = coords[0];
    this._bbox.lon1 = coords[2];
    this._bbox.lat2 = coords[1];
    this._bbox.lon2 = coords[3];
    this.handleChange(true);
  }

  toggleMap(forceDisable?: boolean) {
    let enabled = forceDisable ? true : this.leafletReference.dragging.enabled();
    if (enabled) {
      this.leafletReference.dragging.disable();
      this.leafletReference.scrollWheelZoom.disable();
      this.leafletReference.doubleClickZoom.disable();
      this.leafletReference.touchZoom.disable();
      this.mapEditing = false;
    } else {
      this.leafletReference.dragging.enable();
      this.leafletReference.scrollWheelZoom.enable();
      this.leafletReference.doubleClickZoom.enable();
      this.leafletReference.touchZoom.enable();
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

}
