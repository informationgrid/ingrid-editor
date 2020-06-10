import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FieldType} from '@ngx-formly/material';
import {MapOptions, Rectangle} from 'leaflet';
import {ModalService} from '../../../services/modal/modal.service';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {MatDialog} from '@angular/material/dialog';
import {SpatialDialogComponent} from './spatial-dialog/spatial-dialog.component';
import {LeafletService} from './leaflet.service';
import {SpatialLocation, SpatialLocationWithColor} from './spatial-list/spatial-list.component';
import {distinctUntilChanged, tap} from 'rxjs/operators';

@UntilDestroy()
@Component({
  selector: 'ige-formly--type',
  templateUrl: 'leaflet-type.component.html',
  styleUrls: ['leaflet-type.component.scss']
})
export class LeafletTypeComponent extends FieldType implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('leaflet') leaflet: ElementRef;

  locationsWithColor: SpatialLocationWithColor[] = [];

  private leafletReference: L.Map;
  private locations: SpatialLocation[] = [];
  private drawnSpatialRefs: Rectangle[] = [];
  private highlightedLayer: Rectangle;
  isHighlighted = false;

  constructor(private modalService: ModalService,
              private dialog: MatDialog,
              private leafletService: LeafletService,
              private _changeDetectionRef: ChangeDetectorRef) {
    super();
  }

  ngAfterViewInit() {

    this.leaflet.nativeElement.style.height = this.to.height + 'px';
    this.leaflet.nativeElement.style.width = '100%';

    this.formControl.valueChanges
      .pipe(
        untilDestroyed(this),
        distinctUntilChanged(),
        tap(value => this.locations = value || [])
      )
      .subscribe(() => this.updateBoundingBox());

    try {
      const options: MapOptions = this.to.mapOptions;
      this.leafletReference = this.leafletService.initMap(
        this.leaflet.nativeElement, {...options, ...LeafletService.optionsNonInteractive});
    } catch (e) {
      console.error('Problem initializing the map component.', e);
      this.modalService.showJavascriptError('Problem initializing the map component.', e);
      return;
    }
    // (<MyMap>this.leafletReference)._onResize();

    this.locations = this.formFieldControl.value || [];
    this.updateBoundingBox();

  }

  private updateBoundingBox() {

    this.locationsWithColor = [];
    this.leafletService.removeDrawnBoundingBoxes(this.leafletReference, this.drawnSpatialRefs);

    if (this.locations.length === 0) {
      this.leafletService.zoomToInitialBox(this.leafletReference);
    } else {
      this.locationsWithColor = this.extendLocationsWithColor(this.locations);
      this.drawnSpatialRefs = this.leafletService.drawSpatialRefs(this.leafletReference, this.locationsWithColor);
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

  openSpatialDialog() {

    this.dialog.open(SpatialDialogComponent, {
      width: '90%',
      disableClose: true,
      maxWidth: 1200,
      minWidth: 600,
      minHeight: 'calc(100vh - 90px)',
      height: 'auto'
    }).afterClosed()
      .subscribe((result: SpatialLocation) => {
        if (result) {
          console.log('Spatial result:', result);
          this.locations.push(result);
          this.formControl.setValue(this.locations);
          this.formControl.markAsDirty();
          this.updateBoundingBox();
        }
      });

  }

  private extendLocationsWithColor(locations: SpatialLocation[]): SpatialLocationWithColor[] {

    return locations
      .map((location, index) => ({
        ...location,
        color: this.leafletService.getColor(index)
      }));

  }

  removeLocation(index: number) {

    this.locations.splice(index, 1);
    this.formControl.setValue(this.locations);
    this.formControl.markAsDirty();

    this.updateBoundingBox();

  }

  highlightLocation(location: SpatialLocationWithColor) {

    if (location) {
      this.leafletService.zoomToLayer(this.leafletReference, location);
    } else {
      this.updateBoundingBox();
    }

    this.isHighlighted = location != null;

  }
}
