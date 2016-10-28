import {AfterViewInit, OnDestroy, Component, ElementRef, Input, ViewChild, forwardRef} from '@angular/core';
import {LatLng, Map} from 'leaflet';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {ModalService} from '../../services/modal/modal.service';


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
                Latitude: {{_bbox.lat | number:'1.0-4'}}
                <br>
                Longitude: {{_bbox.lon | number:'1.0-4'}}
            </small>
        </div>
        <input *ngIf="showSearch" #locationQuery type="text" class="form-control" (keyup)="searchLocation(locationQuery)">
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

  constructor(private modalService: ModalService) {
  }

  get bbox(): any {
    return this._bbox;
  }

  writeValue(value: any): void {
    if (!value) {
      this._bbox = {
        lat: 50,
        lon: 12
      };
    } else {
      this._bbox = value;
    }
    if (this.leafletReference && this.bbox) {
      this.outsideSetData = true;
      this.leafletReference.setView(new LatLng(this.bbox.lat, this.bbox.lon));
      this.outsideSetData = false;
    }
  }

  registerOnChange(fn: any): void {
    this._onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
  }

  handleChange(setView?: boolean) {
    if (setView) this.leafletReference.setView(new LatLng(this.bbox.lat, this.bbox.lon));
    this._onChangeCallback(this._bbox);
  }

  ngAfterViewInit() {
    this.leaflet.nativeElement.style.height = this.height + 'px';
    this.leaflet.nativeElement.style.width = '100%';

    if (this.bbox) this.options.center = new LatLng(this.bbox.lat, this.bbox.lon);
    this.leafletReference = L.map(this.leaflet.nativeElement, this.options);
    this.toggleMap(true);
    // this.leafletReference._onResize();

    this.leafletReference.on('moveend', () => {
      // if data was set from outside, then ignore update
      if (this.outsideSetData) return;

      let bounds = this.leafletReference.getBounds();
      let center = bounds.getCenter();
      // console.debug( 'bounds:', center );
      this._bbox.lat = center.lat;
      this._bbox.lon = center.lng;
      this.handleChange(false);
    });
  }

  searchLocation(query: string) {
    this.modalService.showNotImplemented();

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
    this.leafletReference.remove();
    this.leaflet.nativeElement.remove();
  }

}
