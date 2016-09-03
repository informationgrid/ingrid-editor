import {AfterViewInit, OnDestroy, Component, ElementRef, Input, ViewChild} from '@angular/core';

declare var L:any;

@Component( {
  selector: 'leaflet',
  template: '<div #leaflet></div>'
} )
export class LeafletComponent implements AfterViewInit, OnDestroy {
  @ViewChild( 'leaflet' ) leaflet: ElementRef;
  private leafletReference: L.Map;

  @Input() options: L.Map.MapOptions;
  @Input() height: number;

  constructor() {
  }

  ngAfterViewInit() {
    this.leaflet.nativeElement.style.height = this.height + 'px';
    this.leaflet.nativeElement.style.width = '100%';
    this.leafletReference = L.map( this.leaflet.nativeElement, this.options );
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
