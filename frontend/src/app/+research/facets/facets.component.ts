import {AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {FacetGroup, Facets, ResearchService} from '../research.service';
import {Map, Rectangle} from 'leaflet';
import {tap} from 'rxjs/operators';
import {LeafletService} from '../../formly/types/map/leaflet.service';
import {MatDialog} from '@angular/material/dialog';
import {SpatialDialogComponent} from '../../formly/types/map/spatial-dialog/spatial-dialog.component';
import {SpatialLocation} from '../../formly/types/map/spatial-list/spatial-list.component';

export interface FacetUpdate {
  model: any;
  fieldsWithParameters: { [x: string]: any[] }
}

@Component({
  selector: 'ige-facets',
  templateUrl: './facets.component.html',
  styleUrls: ['./facets.component.scss']
})
export class FacetsComponent implements AfterViewInit {

  _model: any = {};
  @Input() set model(value: any) {
    this._model = value;
  };

  @Input() set parameter(value: any) {
    this.updateSpatialFromModel(value);
  }

  @Input()
  set forAddresses(addresses: boolean) {
    this._forAddresses = addresses;
    if (this.allFacets) {
      this.updateFilterGroup();
    }
  }

  get forAddresses(): boolean {
    return this._forAddresses;
  }

  @Output() update = new EventEmitter<FacetUpdate>();

  @ViewChild('leafletDlg') leaflet: ElementRef;

  filterGroup: FacetGroup[];

  private _forAddresses = false;
  private allFacets: Facets;
  private spatialFilterId = '';
  private fieldsWithParameters: { [x: string]: any[] } = {};

  showSpatialFilter = false;

  leafletReference: L.Map;
  notExpanded: any = {};
  location: SpatialLocation;
  private boxes: Rectangle[];

  constructor(private dialog: MatDialog,
              private researchService: ResearchService,
              private leafletService: LeafletService) {
  }

  ngAfterViewInit(): void {
    this.researchService.getQuickFilter()
      .pipe(
        tap(filters => this.allFacets = filters),
        tap(() => this.updateFilterGroup()),
        tap(() => this.sendUpdate())
      ).subscribe();
  }

  initLeaflet() {
    this.leaflet.nativeElement.style.minWidth = '200px';
    this.leaflet.nativeElement.style.height = '200px';
    this.leafletReference = this.leafletService.initMap(this.leaflet.nativeElement, {});
    this.leafletService.zoomToInitialBox(this.leafletReference);
    // @ts-ignore
    setTimeout(() => (<Map>this.leafletReference)._onResize());
  }

  private setDefaultModel(filters: FacetGroup[]) {
    filters.forEach(group => {
      if (this._model[group.id]) {
        // skip initialization, since it's already done for this field
        return;
      }

      this._model[group.id] = {};
      if (group.selection === 'RADIO') {
        this._model[group.id] = group.filter[0].id;
      } else if (group.selection === 'SPATIAL') {
        this.spatialFilterId = group.filter[0].id;
      }
    });
  }

  sendUpdate() {
    this.update.emit({
      model: this._model,
      fieldsWithParameters: this.fieldsWithParameters
    });
  }

  showSpatialDialog(location: SpatialLocation = null) {
    const data: Partial<SpatialLocation> = location ?? {
      limitTypes: ['free'],
      type: 'free'
    }

    this.dialog.open(SpatialDialogComponent, {
      data: data
    }).afterClosed().subscribe(result => this.updateSpatial(result));
  }

  toggleSection(id: string) {
    this.notExpanded[id] = !this.notExpanded[id];
    if (id === 'spatial' && this.notExpanded.spatial) {
      setTimeout(() => this.leafletReference.invalidateSize());
    }
  }

  private updateSpatial(location: SpatialLocation) {
    if (this.boxes) {
      this.leafletService.removeDrawnBoundingBoxes(this.leafletReference, this.boxes);
    }

    this.location = location;

    if (!location) return;

    this._model.spatial = {};
    this._model.spatial[this.spatialFilterId] = [];
    this.fieldsWithParameters[this.spatialFilterId] = [
      location.value.lat1,
      location.value.lon1,
      location.value.lat2,
      location.value.lon2
    ];

    this.boxes = this.leafletService.drawSpatialRefs(this.leafletReference, [{
      value: location.value,
      type: location.type,
      title: location.title,
      color: this.leafletService.getColor(0),
      indexNumber: 0
    }]);

    this.sendUpdate();
  }

  removeLocation() {
    this.location = null;
    delete this.fieldsWithParameters.spatial;
    delete this._model.spatial[this.spatialFilterId];
    this.leafletService.removeDrawnBoundingBoxes(this.leafletReference, this.boxes);

    this.sendUpdate();
  }

  private updateFilterGroup() {
    const filter = this.allFacets[this._forAddresses ? 'addresses' : 'documents'];
    this.setDefaultModel(filter);
    this.filterGroup = filter;

    if (filter.some(f => f.selection === 'SPATIAL')) {
      setTimeout(() => this.initLeaflet(), 200);
    }
  }

  private updateSpatialFromModel(parameter: any) {
    if (!parameter || Object.keys(parameter).length === 0) {
      this.updateSpatial(null);
      return;
    }

    const location = Object.keys(parameter).map(key => {
      const coords = parameter[key];
      return <SpatialLocation>{
        type: 'free',
        value: {
          lon1: coords[0],
          lat1: coords[1],
          lon2: coords[2],
          lat2: coords[3]
        }
      };
    })[0];
    this.updateSpatial(location);
  }
}
