import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FieldType} from '@ngx-formly/material';
import {LatLngBounds, Map, Rectangle, TileLayer} from 'leaflet';
import {ModalService} from '../../services/modal/modal.service';
import {NominatimService} from '../../+form/leaflet/nominatim.service';
import {LeafletAreaSelect} from '../../+form/leaflet/leaflet-area-select';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {FormControl} from '@angular/forms';

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

  @ViewChild('leaflet', {static: true}) leaflet: ElementRef;
  private leafletReference: L.Map;
  private areaSelect: any;
  drawnBBox: any;

  _bbox: any = null;
  private _bboxPrevious: any;

  showSearch = false;

  nominatimResult: any = [];
  searchInput = new FormControl();

  private static getLatLngBoundsFromBox(bbox: any): LatLngBounds {
    if (!bbox) {
      return null;
    }

    return new LatLngBounds([bbox.lat1, bbox.lon1], [bbox.lat2, bbox.lon2]);
  }

  constructor(private modalService: ModalService, private nominatimService: NominatimService,
              private _changeDetectionRef: ChangeDetectorRef) {
    super();
  }

  ngAfterViewInit() {
    this.leaflet.nativeElement.style.height = this.to.height + 'px';
    this.leaflet.nativeElement.style.width = '100%';

    this.formControl.valueChanges
      .pipe(
        untilDestroyed(this),
        distinctUntilChanged()
      )
      .subscribe(value => this.updateBoundingBox(value));

    this.searchInput.valueChanges
      .pipe(
        untilDestroyed(this),
        debounceTime(500)
      )
      .subscribe(query => this.searchLocation(query));

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

    this.updateBoundingBox(this.formFieldControl.value);

  }

  private updateBoundingBox(value) {
    console.log('new bbox', value);

    if (!value) {
      this._bbox = null;
      this.zoomToInitialBox();
      this.removeDrawnBoundingBox();
    } else {
      this._bbox = value;
      this.drawBoxAndZoomToBounds();
    }
  }

  get bbox(): any {
    return this._bbox;
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
    return box ? this.leafletReference.fitBounds(box, {maxZoom: 13}) : this.leafletReference;
  }

  private drawBoxAndZoomToBounds(): Map {
    try {
      const box = LeafletTypeComponent.getLatLngBoundsFromBox(this._bbox);
      if (box) {
        this.drawBoundingBox(box);
        return this.leafletReference.fitBounds(box, {maxZoom: 13});
      } else {
        return this.leafletReference;
      }
    } catch (ex) {
      console.error('Problem drawing bounding box', ex);
      this._bbox = null;
      return this.zoomToInitialBox();
    }
  }

  handleChange(setView?: boolean) {
    if (setView) {
      // this.leafletReference.setView(new LatLng(this.bbox.lat, this.bbox.lon));
      this.leafletReference.fitBounds(
        new LatLngBounds([this._bbox.lat1, this._bbox.lon1], [this._bbox.lat2, this._bbox.lon2]),
        {maxZoom: 13});
    }

    this.formControl.setValue(this._bbox);
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
    setTimeout(() => updateAreaSelect(), 270);
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
      const bbox = this.drawnBBox;
      setTimeout(() => this.leafletReference.removeLayer(bbox), 100);
      this.drawnBBox = null;
    }
  }

  cancelEdit() {
    // this.showSearch = false;
    this._bbox = this._bboxPrevious;
    if (!this.bbox) {
      this.removeDrawnBoundingBox();
    }
    this.areaSelect.remove();
    this.drawBoxAndZoomToBounds();
    this.toggleSearch(false);
  }

  applyEdit() {
    // this.showSearch = false;
    this.applyAreaSelect();
    this.toggleSearch(false);
  }
}
