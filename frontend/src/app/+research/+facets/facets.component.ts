import {AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {FacetGroup, Facets, ResearchService} from '../research.service';
import {Map, Rectangle} from 'leaflet';
import {tap} from 'rxjs/operators';
import {LeafletService} from '../../formly/types/map/leaflet.service';
import {MatDialog} from '@angular/material/dialog';
import {SpatialDialogComponent} from '../../formly/types/map/spatial-dialog/spatial-dialog.component';
import {SpatialLocation} from '../../formly/types/map/spatial-list/spatial-list.component';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';

export interface FacetUpdate {
  model: any;
  fieldsWithParameters: { [x: string]: any[] }
}

@UntilDestroy()
@Component({
  selector: 'ige-facets',
  templateUrl: './facets.component.html',
  styleUrls: ['./facets.component.scss']
})
export class FacetsComponent implements AfterViewInit {

  _model: any = {};
  @Input() set model(value: any) {
    this._model = JSON.parse(JSON.stringify(value));
  };

  _parameter: any;
  @Input() set parameter(value: any) {
    this._parameter = value;
    if (this.isInitialized) {
      // delay update for other inputs to be present
      setTimeout(() => this.updateSpatialFromModel(value));
    }
  }

  @Input() refreshView: EventEmitter<void>;

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
  private isInitialized = false;

  constructor(private dialog: MatDialog,
              private researchService: ResearchService,
              private leafletService: LeafletService) {
  }

  ngAfterViewInit(): void {
    this.researchService.getQuickFilter()
      .pipe(
        tap(filters => this.allFacets = filters),
        tap(() => this.updateFilterGroup()),
        tap(() => {
          this.isInitialized = true;
          this.updateSpatialFromModel(this._parameter);
        })
      ).subscribe();

    if (this.refreshView) {
      this.refreshView
        .pipe(untilDestroyed(this))
        .subscribe(() => {
          // @ts-ignore
          (<Map>this.leafletReference)._onResize();
          if (Object.keys(this._parameter).length > 0) {
            setTimeout(() => this.updateMap(this.convertParameterToLocation(this._parameter)));
          } else {
            setTimeout(() => this.leafletService.zoomToInitialBox(this.leafletReference));
          }
        });
    }
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
      }
    });
  }

  private determineSpatialFilterId(filters: FacetGroup[]) {
    return filters
      .find(group => group.selection === 'SPATIAL')
      ?.filter[0]?.id;
  }

  sendUpdate() {
    this.update.emit({
      model: this._model,
      fieldsWithParameters: {...this.fieldsWithParameters}
    });
  }

  showSpatialDialog(location: SpatialLocation = null) {
    const data: Partial<SpatialLocation> = location ?? {
      limitTypes: ['free'],
      type: 'free'
    };

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

    this.updateMap(location);

    this.sendUpdate();
  }

  private updateMap(location: SpatialLocation) {
    if (!this.leafletReference) {
      console.log('Map not initialized yet ... try again updating spatial');
      setTimeout(() => this.updateMap(location), 100);
      return;
    }

    if (this.boxes) {
      this.leafletService.removeDrawnBoundingBoxes(this.leafletReference, this.boxes);
    }
    this.boxes = this.leafletService.drawSpatialRefs(this.leafletReference, [{
      value: location.value,
      type: location.type,
      title: location.title,
      color: this.leafletService.getColor(0),
      indexNumber: 0
    }]);
  }

  removeLocation() {
    this.location = null;
    delete this.fieldsWithParameters.spatial;
    delete this._model.spatial[this.spatialFilterId];
    this.leafletService.removeDrawnBoundingBoxes(this.leafletReference, this.boxes);
    this.boxes = null;

    this.sendUpdate();
  }

  private updateFilterGroup() {
    const filter = this.allFacets[this._forAddresses ? 'addresses' : 'documents'];
    this.spatialFilterId = this.determineSpatialFilterId(filter);
    this.setDefaultModel(filter);
    this.filterGroup = filter;

    if (filter.some(f => f.selection === 'SPATIAL')) {
      setTimeout(() => {
        this.initLeaflet();
        this.updateSpatialFromModel(this._parameter);
      }, 200);
    }
  }

  private updateSpatialFromModel(parameter: any) {
    const location = this.convertParameterToLocation(parameter);
    this.updateSpatial(location);
  }

  private convertParameterToLocation(parameter: any): SpatialLocation {

    if (!parameter || Object.keys(parameter).length === 0) {
      return null;
    }

    return Object.keys(parameter).map(key => {
      const coords = parameter[key];
      return <SpatialLocation>{
        type: 'free',
        value: {
          lat1: coords[0],
          lon1: coords[1],
          lat2: coords[2],
          lon2: coords[3]
        }
      };
    })[0];
  }
}
