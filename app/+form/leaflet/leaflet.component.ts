import {
  AfterViewInit, OnDestroy, Component, ElementRef, Input, ViewChild, OnChanges,
  SimpleChanges, forwardRef
} from '@angular/core';
import {LatLng, Map} from 'leaflet';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";


export const LEAFLET_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => LeafletComponent),
  multi: true
};


@Component({
  selector: 'leaflet',
  template: `
    <div #leaflet></div>
    <div class="fieldContainer half">
        <input type="text" class="form-control" [(ngModel)]="_bbox.lat" (change)="handleChange()">
    </div>
    <div class="fieldContainer half">
        <input type="text" class="form-control" [(ngModel)]="_bbox.lon" (change)="handleChange()">
    </div>
  `,
  providers: [LEAFLET_CONTROL_VALUE_ACCESSOR]
})
export class LeafletComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {

  @ViewChild('leaflet') leaflet: ElementRef;
  private leafletReference: L.Map;

  @Input() options: Map.MapOptions;
  @Input() height: number;
  // @Input() bbox: any;

  private _onChangeCallback: (x: any) => void;
  private _bbox: any = {};


  constructor() {
  }

  get bbox(): any {
    return this._bbox;
  }

  writeValue(value: any): void {
    if (!value) {
      this._bbox = {
        lat: 50,
        lon: 12
      }
    } else {
      this._bbox = value;
    }
    if (this.leafletReference && this.bbox) {
      this.leafletReference.setView(new LatLng(this.bbox.lat, this.bbox.lon));
    }
  }

  registerOnChange(fn: any): void {
    this._onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
  }

  handleChange() {
    this.leafletReference.setView(new LatLng(this.bbox.lat, this.bbox.lon));
    this._onChangeCallback(this._bbox);
  }

  ngAfterViewInit() {
    this.leaflet.nativeElement.style.height = this.height + 'px';
    this.leaflet.nativeElement.style.width = '100%';

    if (this.bbox) this.options.center = new LatLng(this.bbox.lat, this.bbox.lon);
    this.leafletReference = L.map(this.leaflet.nativeElement, this.options);
    // this.leafletReference._onResize();
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
