import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {LatLngBounds, Map, MapOptions, Rectangle} from 'leaflet';
import {LeafletAreaSelect} from '../../../../+form/leaflet/leaflet-area-select';
import {FormControl} from '@angular/forms';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {debounceTime} from 'rxjs/operators';
import {NominatimService} from '../../../../+form/leaflet/nominatim.service';
import {LeafletService} from '../leaflet.service';

class MyMap extends Map {
  _onResize: () => {};
}

@UntilDestroy()
@Component({
  selector: 'ige-spatial-dialog',
  templateUrl: './spatial-dialog.component.html',
  styleUrls: ['./spatial-dialog.component.scss']
})
export class SpatialDialogComponent implements OnInit, AfterViewInit {

  @ViewChild('leafletDlg') leaflet: ElementRef;
  private leafletReference: L.Map;

  private areaSelect: any;
  drawnBBox: any;
  _bbox: any = null;
  get bbox(): any {
    return this._bbox;
  }

  private _bboxPrevious: any;
  nominatimResult: any = [];
  searchInput = new FormControl();


  constructor(private nominatimService: NominatimService, private leafletService: LeafletService) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.searchInput.valueChanges
      .pipe(
        untilDestroyed(this),
        debounceTime(500)
      )
      .subscribe(query => this.searchLocation(query));

    this.leaflet.nativeElement.style.height = '300px';
    this.leaflet.nativeElement.style.width = '100%';
    this.leaflet.nativeElement.style.minWidth = '400px';
    // const options: MapOptions = this.to.mapOptions;
    this.leafletReference = this.leafletService.initMap(this.leaflet.nativeElement, {});
    this.leafletService.zoomToInitialBox(this.leafletReference);

    this.setupAreaSelect();
  }


  searchLocation(query: string) {
    this.nominatimService.search(query).subscribe((response: any) => {
      this.nominatimResult = response;
      console.log('Nominatim:', response);
      setTimeout(() => (<MyMap>this.leafletReference)._onResize());
    });
  }

  handleSelection(event) {
    if (event.option.selected) {
      event.source.deselectAll();
      event.option._setSelected(true);
    }

    this.showBoundingBox(event.option.value);
  }

  showBoundingBox(coords: string[]) {
    this._bbox = {
      lat1: coords[0],
      lon1: coords[2],
      lat2: coords[1],
      lon2: coords[3]
    };
    this.drawBoxAndZoomToBounds();
    // this.handleChange(false);
    // let latLonBounds = this.getLatLngBoundsFromBox(bbox);
    this.setAreaSelect();
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

  private drawBoxAndZoomToBounds(): Map {
    try {
      const box = LeafletService.getLatLngBoundsFromBox(this._bbox);
      if (box) {
        this.drawBoundingBox(box);
        return this.leafletReference.fitBounds(box, {maxZoom: 18});
      } else {
        return this.leafletReference;
      }
    } catch (ex) {
      console.error('Problem drawing bounding box', ex);
      this._bbox = null;
      return this.leafletService.zoomToInitialBox(this.leafletReference);
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
      // this.handleChange(false);
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
  }

  applyEdit() {
    this.applyAreaSelect();
  }


}
