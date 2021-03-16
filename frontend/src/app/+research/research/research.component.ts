import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {ResearchResponse, ResearchService} from './research.service';
import {debounceTime} from 'rxjs/operators';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {ProfileService} from '../../services/profile.service';
import {SelectOption} from '../../services/codelist/codelist.service';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {FormControl} from '@angular/forms';
import {FacetUpdate} from './facets/facets.component';

@UntilDestroy()
@Component({
  selector: 'ige-research',
  templateUrl: './research.component.html',
  styleUrls: ['./research.component.scss']
})
export class ResearchComponent implements OnInit, AfterViewInit {

  @ViewChild(MatSort) sort: MatSort;


  displayedColumns: string[] = [];

  query = new FormControl('');

  totalHits: number = 0;
  dataSource = new MatTableDataSource([]);
  sqlValue: string = '';
  columnsMap: SelectOption[];
  private filter: FacetUpdate;

  constructor(private researchService: ResearchService,
              private profileService: ProfileService) {
  }

  ngOnInit() {
    this.columnsMap = this.profileService.getProfiles()[0].fieldsMap;

    this.query.valueChanges
      .pipe(
        untilDestroyed(this),
        debounceTime(300)
      )
      .subscribe(query => this.startSearch());

  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    setTimeout(() => this.displayedColumns = ['title'], 300);
  }

  updateFilter(info: FacetUpdate) {
    this.filter = info;
    this.startSearch();
  }

  startSearch() {
    setTimeout(() => {
      // this.applyImplicitFilter(this.model);
      return this.researchService.search(
        this.query.value,
        this.filter.model,
        this.filter.fieldsWithParameters)
        .subscribe(result => this.updateHits(result));
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

/*
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
*/

}
