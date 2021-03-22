import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {ResearchResponse, ResearchService} from './research.service';
import {debounceTime, map} from 'rxjs/operators';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {ProfileService} from '../../services/profile.service';
import {SelectOption} from '../../services/codelist/codelist.service';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {FormControl} from '@angular/forms';
import {FacetUpdate} from './facets/facets.component';
import {QueryQuery} from '../../store/query/query.query';
import {ActivatedRoute} from '@angular/router';
import {MatPaginator} from '@angular/material/paginator';

@UntilDestroy()
@Component({
  selector: 'ige-research',
  templateUrl: './research.component.html',
  styleUrls: ['./research.component.scss']
})
export class ResearchComponent implements OnInit, AfterViewInit {

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  selectedIndex = 0;

  displayedColumns: string[] = [];

  query = new FormControl('');

  totalHits: number = 0;
  dataSource = new MatTableDataSource([]);
  sqlValue: string = '';
  profileIconsMap: {};
  columnsMap: SelectOption[];
  filter: FacetUpdate = {
    model: {},
    fieldsWithParameters: {}
  };

  constructor(private route: ActivatedRoute,
              private researchService: ResearchService,
              private profileService: ProfileService,
              private queryQuery: QueryQuery) {
  }

  ngOnInit() {
    this.query.setValue(this.route.snapshot.params.q ?? '');
    this.filter.model = {
      type: this.route.snapshot.params.type ?? ''
    };

    let profiles = this.profileService.getProfiles();
    this.profileIconsMap = profiles.reduce( (acc, val) => {
      acc[val.id] = val.iconClass;
      return acc;
    }, {});
    this.columnsMap = profiles[0].fieldsMap;
    this.researchService.loadQueries().subscribe();

    this.query.valueChanges
      .pipe(
        untilDestroyed(this),
        debounceTime(300)
      )
      .subscribe(query => this.startSearch());

  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
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
        .pipe(
          map(result => {
            result.hits.forEach(hit => {
              hit.icon = this.profileService.getDocumentIcon(hit);
            });
            return result
          })
        )
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
    // setTimeout(() => this.displayedColumns = ['_type', 'title'], 500);
    if (this.displayedColumns.length === 0) {
      this.displayedColumns = ['_type', 'title', 'settings'];
    }
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

  loadQuery(id: string) {
    this.selectedIndex = 1;
    let entity = JSON.parse(JSON.stringify(this.queryQuery.getEntity(id)));
    this.filter.model = entity.definition.model;
    this.filter.fieldsWithParameters = entity.definition.parameter;
    this.query.setValue(entity.definition.term);
  }

  saveQuery() {
    this.researchService.saveQuery(this.query.value, this.filter.model, this.filter.fieldsWithParameters)
      .subscribe();
  }
}
