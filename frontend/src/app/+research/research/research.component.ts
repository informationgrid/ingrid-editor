import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FacetGroup, ResearchResponse, ResearchService} from './research.service';
import {debounceTime, tap} from 'rxjs/operators';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {ProfileService} from '../../services/profile.service';
import {SelectOption} from '../../services/codelist/codelist.service';
import {LeafletService} from '../../formly/types/map/leaflet.service';
import {Map} from 'leaflet';
import {Observable} from 'rxjs';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {FormControl} from '@angular/forms';

@UntilDestroy()
@Component({
  selector: 'ige-research',
  templateUrl: './research.component.html',
  styleUrls: ['./research.component.scss']
})
export class ResearchComponent implements OnInit, AfterViewInit {

  @ViewChild(MatSort) sort: MatSort;

  @ViewChild('leafletDlg') leaflet: ElementRef;

  leafletReference: L.Map;

  filterGroup: Observable<FacetGroup[]> = this.researchService.getQuickFilter()
    .pipe(
      tap(filters => this.quickFilters = filters),
      tap(filters => this.prepareModel(filters)),
      tap(() => this.updateFilter()),
      tap(() => this.displayedColumns = ['title']),
      tap(() => setTimeout(() => this.initLeaflet(), 200))
    );

  model: any;
  displayedColumns: string[] = [];

  query = new FormControl('');

  totalHits: number = 0;
  dataSource = new MatTableDataSource([]);
  sqlValue: string = '';
  columnsMap: SelectOption[];
  private quickFilters: FacetGroup[];

  showSpatialFilter: boolean;
  private spatialFilterIds: string[] = [];
  private fieldsWithParameters: { [x: string]: any[] } = {};

  constructor(private researchService: ResearchService,
              private profileService: ProfileService,
              private leafletService: LeafletService) {
  }

  ngOnInit() {
    this.columnsMap = this.profileService.getProfiles()[0].fieldsMap;

    this.query.valueChanges
      .pipe(
        untilDestroyed(this),
        debounceTime(300)
      )
      .subscribe(query => this.updateFilter());
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  initLeaflet() {
    this.leaflet.nativeElement.style.width = '200px';
    this.leaflet.nativeElement.style.minWidth = '200px';
    this.leafletReference = this.leafletService.initMap(this.leaflet.nativeElement, {});
    this.leafletService.zoomToInitialBox(this.leafletReference);
    const updateSpatialQuery = () => {
      this.updateSpatial();
      this.updateFilter();
    }
    this.leafletReference.on('zoomend', () => updateSpatialQuery());
    this.leafletReference.on('moveend', () => updateSpatialQuery());
    // @ts-ignore
    setTimeout(() => (<Map>this.leafletReference)._onResize());
  }

  updateFilter(implicitFilter?: string[]) {
    setTimeout(() => {
      // this.applyImplicitFilter(this.model);
      return this.researchService.search(this.query.value, this.model, this.fieldsWithParameters)
        .subscribe(result => this.updateHits(result));
    });
  }

  private prepareModel(filters: FacetGroup[]) {
    this.model = {};
    filters.forEach(group => {
      this.model[group.id] = {};
      if (group.selection === 'OR') {
        this.model[group.id] = group.filter[0].id;
      } else if (group.selection === 'SPATIAL') {
        this.spatialFilterIds.push(group.filter[0].id);
        /*this.model[group.id] = {};
        this.model[group.id][group.filter[0].id] = [];*/
      }
    });
  }

  queryBySQL(sql: string) {
    this.researchService.searchBySQL(sql)
      .subscribe(result => this.updateHits(result));
  }

  private updateHits(result: ResearchResponse) {
    this.totalHits = result.totalHits;
    this.dataSource.data = result.hits;
  }

  updateSql(index: number) {
    if (index === 0) {
      this.sqlValue = `SELECT *
                       FROM document
                       WHERE type = 'AddressDoc'
                         AND LOWER(title) LIKE '%test%'`;
    } else if (index === 1) {
      this.sqlValue = `SELECT *
                       FROM document
                       WHERE type = 'mCloudDoc'
                         AND data -> 'mCloudCategories' @> '"aviation"'`;
    }
  }

  private applyImplicitFilter(model: any) {
    let spatial = model.clauses.clauses.filter(c => c.value.indexOf('mCloudSelectSpatial') !== -1);
    if (spatial.length > 0 && spatial[0].parameter.length === 4) {
      const spatialFilter = this.quickFilters
        .map(groups => groups.filter)
        .map(filter => filter.find(f => f.id === 'mCloudSelectSpatial'));
      if (spatialFilter.length > 0) {
        spatialFilter[0].implicitFilter;
      }
    }
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
    } else {
      delete this.fieldsWithParameters[id];
      delete this.model.spatial[id];
    }
    this.updateFilter();
  }
}
