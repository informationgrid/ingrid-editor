import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {FacetGroup, ResearchResponse, ResearchService} from './research.service';
import {tap} from 'rxjs/operators';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {ProfileService} from '../../services/profile.service';
import {SelectOption} from '../../services/codelist/codelist.service';

@Component({
  selector: 'ige-research',
  templateUrl: './research.component.html',
  styleUrls: ['./research.component.scss']
})
export class ResearchComponent implements OnInit, AfterViewInit {

  @ViewChild(MatSort) sort: MatSort;

  filterGroup = this.researchService.getQuickFilter()
    .pipe(
      tap(filters => this.quickFilters = filters),
      tap(filters => this.prepareModel(filters)),
      tap(() => this.updateFilter())
    );

  model: any;
  displayedColumns: string[] = [];

  totalHits: number = 0;
  dataSource = new MatTableDataSource([]);
  sqlValue: string = '';
  columnsMap: SelectOption[];
  private quickFilters: FacetGroup[];

  constructor(private researchService: ResearchService,
              private profileService: ProfileService) {
  }

  ngOnInit() {
    this.columnsMap = this.profileService.getProfiles()[0].fieldsMap;
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    setTimeout(() => this.displayedColumns = ['title'], 100);
  }

  updateFilter(implicitFilter?: string[]) {
    setTimeout(() => {
      // this.applyImplicitFilter(this.model);
      return this.researchService.search(this.model)
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
        this.model[group.id] = {};
        this.model[group.id][group.filter[0].id] = [];
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

  /*toggleColumn(value: string) {
    this.displayedColumns.includes(value)
      ? this.displayedColumns.splice(this.displayedColumns.indexOf(value), 1)
      : this.displayedColumns.push(value);
  }*/

  private applyImplicitFilter(model: any) {
    let spatial = model.clauses.clauses.filter(c => c.value.indexOf('mCloudSelectSpatial') !== -1);
    if (spatial.length > 0 && spatial[0].parameter.length === 4) {
      const spatialFilter = this.quickFilters
        .map(groups => groups.filter)
        .map(filter => filter.find(f => f.id === 'mCloudSelectSpatial'));
      if (spatialFilter.length > 0) {
        spatialFilter[0].implicitFilter
      }
    }
  }
}
