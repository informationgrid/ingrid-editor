import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FacetGroup, ResearchService} from '../research.service';
import {Observable} from 'rxjs';
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

  @Input()
  set forAddresses(addresses: boolean) {
    this._forAddresses = addresses;
    if (this.allFacets) {
      // this._model = {};
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
  expanded: any = {};
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
    this.model.type = 'selectDocuments';

    filters.forEach(group => {
      if (this.model[group.id]) {
        // skip initialization, since it's already done for this field
        return;
      }

      this.model[group.id] = {};
      if (group.selection === 'RADIO') {
        this.model[group.id] = group.filter[0].id;
      } else if (group.selection === 'SPATIAL') {
        this.spatialFilterIds.push(group.filter[0].id);
      }
    });
  }

  toggleSpatialFilter(id: string, checked: boolean) {
    this.showSpatialFilter = checked;
    if (checked) {
      this.leafletReference.invalidateSize();
    } else {
      delete this.fieldsWithParameters[id];
      delete this.model.spatial[id];
      this.sendUpdate();
    }
  }

  sendUpdate() {
    this.update.emit({
      model: this.model,
      fieldsWithParameters: this.fieldsWithParameters
    });
  }

  showSpatialDialog(id: string) {
    this.dialog.open(SpatialDialogComponent, {
      data: <SpatialLocation>{
        limitTypes: ['free']
      }
    })
      .afterClosed().subscribe(result => this.updateSpatial(id, result));
  }

  toggleSection(id: string) {
    this.expanded[id] = !this.expanded[id];
    if (id === 'spatial' && this.expanded.spatial) {
      setTimeout(() => this.leafletReference.invalidateSize());
    }
  }

  private updateSpatial(id: string, location: SpatialLocation) {
    if (this.boxes) {
      this.leafletService.removeDrawnBoundingBoxes(this.leafletReference, this.boxes);
    }

    if (!location) return;

    this.location = location;

    this.model.spatial = {};
    this.model.spatial[id] = [];
    this.fieldsWithParameters[this.spatialFilterIds[0]] = [
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
}
