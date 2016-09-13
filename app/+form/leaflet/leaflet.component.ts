import {
  AfterViewInit, OnDestroy, Component, ElementRef, Input, ViewChild, OnChanges,
  SimpleChanges
} from '@angular/core';
import {LatLng, Map} from 'leaflet';

@Component({
  selector: 'leaflet',
  template: '<div #leaflet></div>'
})
export class LeafletComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('leaflet') leaflet: ElementRef;
  private leafletReference: L.Map;

  @Input() options: Map.MapOptions;
  @Input() height: number;
  @Input() bbox: any;

  constructor() {
  }

  ngAfterViewInit() {
    this.leaflet.nativeElement.style.height = this.height + 'px';
    this.leaflet.nativeElement.style.width = '100%';

    if (this.bbox) this.options.center = new LatLng(this.bbox.x, this.bbox.y);
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

  ngOnChanges(changes: SimpleChanges): void {
    if (this.leafletReference && this.bbox) {
      this.leafletReference.setView(new LatLng(this.bbox.x, this.bbox.y) );
    }
  }
}
