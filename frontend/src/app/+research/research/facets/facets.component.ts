import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FacetGroup, ResearchService} from '../research.service';
import {Observable} from 'rxjs';
import {Map} from 'leaflet';
import {tap} from 'rxjs/operators';
import {LeafletService} from '../../../formly/types/map/leaflet.service';

export interface FacetUpdate {
  model: any;
  fieldsWithParameters: { [x: string]: any[] }
}

@Component({
  selector: 'ige-facets',
  templateUrl: './facets.component.html',
  styleUrls: ['./facets.component.scss']
})
export class FacetsComponent implements OnInit {

  @Input() model: any;

  @Output() update = new EventEmitter<FacetUpdate>();

  @ViewChild('leafletDlg') leaflet: ElementRef;

  filterGroup: Observable<FacetGroup[]> = this.researchService.getQuickFilter()
    .pipe(
      tap(filters => this.prepareModel(filters)),
      tap(() => this.sendUpdate()),
      tap(() => setTimeout(() => this.initLeaflet(), 200))
    );


  private spatialFilterIds: string[] = [];
  private fieldsWithParameters: { [x: string]: any[] } = {};

  showSpatialFilter = false;

  leafletReference: L.Map;

  constructor(private researchService: ResearchService,
              private leafletService: LeafletService) {
  }

  ngOnInit(): void {
  }

  initLeaflet() {
    this.leaflet.nativeElement.style.width = '200px';
    this.leaflet.nativeElement.style.minWidth = '200px';
    this.leafletReference = this.leafletService.initMap(this.leaflet.nativeElement, {});
    this.leafletService.zoomToInitialBox(this.leafletReference);
    const updateSpatialQuery = () => {
      this.updateSpatial();
      this.sendUpdate();
    };
    this.leafletReference.on('zoomend', () => updateSpatialQuery());
    this.leafletReference.on('moveend', () => updateSpatialQuery());
    // @ts-ignore
    setTimeout(() => (<Map>this.leafletReference)._onResize());
  }

  private prepareModel(filters: FacetGroup[]) {
    // this.model = {};
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

  private updateSpatial() {
    let bounds = this.leafletReference.getBounds();
    this.fieldsWithParameters[this.spatialFilterIds[0]] = [
      bounds.getSouthWest().lat,
      bounds.getSouthWest().lng,
      bounds.getNorthEast().lat,
      bounds.getNorthEast().lng
    ];
  }

  toggleSpatialFilter(id: string, checked: boolean) {
    this.showSpatialFilter = checked;
    if (checked) {
      this.model.spatial = {};
      this.model.spatial[id] = [];
      this.updateSpatial();
      this.leafletReference.invalidateSize();
    } else {
      delete this.fieldsWithParameters[id];
      delete this.model.spatial[id];
    }

    this.sendUpdate();
  }

  sendUpdate() {
    this.update.emit({
      model: this.model,
      fieldsWithParameters: this.fieldsWithParameters
    });
  }
}
