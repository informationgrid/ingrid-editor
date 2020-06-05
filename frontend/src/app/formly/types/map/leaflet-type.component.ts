import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FieldType} from '@ngx-formly/material';
import {Map, MapOptions} from 'leaflet';
import {ModalService} from '../../../services/modal/modal.service';
import {UntilDestroy} from '@ngneat/until-destroy';
import {MatDialog} from '@angular/material/dialog';
import {SpatialDialogComponent} from './spatial-dialog/spatial-dialog.component';
import {LeafletService} from './leaflet.service';

class MyMap extends Map {
  _onResize: () => {};
}

@UntilDestroy()
@Component({
  selector: 'ige-formly--type',
  templateUrl: 'leaflet-type.component.html',
  styleUrls: ['leaflet-type.component.scss']
})
export class LeafletTypeComponent extends FieldType implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('leaflet') leaflet: ElementRef;
  private leafletReference: L.Map;

  constructor(private modalService: ModalService,
              private dialog: MatDialog,
              private leafletService: LeafletService,
              private _changeDetectionRef: ChangeDetectorRef) {
    super();
  }

  ngAfterViewInit() {
    this.leaflet.nativeElement.style.height = this.to.height + 'px';
    this.leaflet.nativeElement.style.width = '100%';

    /*this.formControl.valueChanges
      .pipe(
        untilDestroyed(this),
        distinctUntilChanged()
      )
      .subscribe(value => this.updateBoundingBox(value));*/

    try {
      const options: MapOptions = this.to.mapOptions;
      this.leafletReference = this.leafletService.initMap(
        this.leaflet.nativeElement, {...options, ...LeafletService.optionsNonInteractive});
    } catch (e) {
      console.error('Problem initializing the map component.', e);
      this.modalService.showJavascriptError('Problem initializing the map component.', e);
      return;
    }
    // this.toggleSearch(false);
    // (<MyMap>this.leafletReference)._onResize();

    this.updateBoundingBox(this.formFieldControl.value);

  }

  private updateBoundingBox(value) {
    console.log('new bbox', value);

    if (!value) {
      // this._bbox = null;
      this.leafletService.zoomToInitialBox(this.leafletReference);
      // this.removeDrawnBoundingBox();
    } else {
      // this._bbox = value;
      // this.drawBoxAndZoomToBounds();
    }
  }

  /*handleChange(setView?: boolean) {
    if (setView) {
      // this.leafletReference.setView(new LatLng(this.bbox.lat, this.bbox.lon));
      this.leafletReference.fitBounds(
        new LatLngBounds([this._bbox.lat1, this._bbox.lon1], [this._bbox.lat2, this._bbox.lon2]),
        {maxZoom: 13});
    }

    this.formControl.setValue(this._bbox);
  }*/

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

  openSpatialDialog() {
    this.dialog.open(SpatialDialogComponent, {
      width: '90%',
      maxWidth: 1000,
      minWidth: 600
    }).afterClosed()
      .subscribe(result => {
        console.log('Spatial result:', result);
      });
  }
}
