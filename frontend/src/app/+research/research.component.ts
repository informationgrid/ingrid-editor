import {Component, OnInit} from '@angular/core';
import {ResearchResponse, ResearchService} from './research.service';
import {debounceTime, map} from 'rxjs/operators';
import {ProfileService} from '../services/profile.service';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {FormControl} from '@angular/forms';
import {FacetUpdate} from './facets/facets.component';
import {QueryQuery} from '../store/query/query.query';
import {ActivatedRoute, Router} from '@angular/router';
import {SaveQueryDialogComponent} from './save-query-dialog/save-query-dialog.component';
import {Query} from '../store/query/query.model';
import {MatDialog} from '@angular/material/dialog';
import {MatSelectChange} from '@angular/material/select';

@UntilDestroy()
@Component({
  selector: 'ige-research',
  templateUrl: './research.component.html',
  styleUrls: ['./research.component.scss']
})
export class ResearchComponent implements OnInit {

  selectedIndex = 0;

  query = new FormControl('');

  totalHits: number = 0;

  searchClass: 'selectDocuments' | 'selectAddresses';

  filter: FacetUpdate = {
    model: {},
    fieldsWithParameters: {}
  };
  result: ResearchResponse;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private dialog: MatDialog,
              private researchService: ResearchService,
              private profileService: ProfileService,
              private queryQuery: QueryQuery) {
  }

  ngOnInit() {
    this.query.setValue(this.route.snapshot.params.q ?? '');
    this.searchClass = this.route.snapshot.params.type ?? 'selectDocuments';

    this.researchService.fetchQueries();

    this.query.valueChanges
      .pipe(
        untilDestroyed(this),
        debounceTime(300)
      )
      .subscribe(query => this.startSearch());

  }

  updateFilter(info: FacetUpdate) {
    this.filter = info;
    this.startSearch();
  }

  startSearch() {
    // complete model with other parameters
    this.filter.model.type = this.searchClass;

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
            return result;
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
    this.result = result;
    // this.totalHits = result.totalHits;
    // this.dataSource.data = result.hits;
    // setTimeout(() => this.displayedColumns = ['_type', 'title'], 500);
    // if (this.displayedColumns.length === 0) {
    //   this.displayedColumns = ['_type', 'title', '_modified', 'settings'];
    // }
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
    let entity: Query = JSON.parse(JSON.stringify(this.queryQuery.getEntity(id)));
    this.selectedIndex = entity.type === 'facet' ? 0 : 2;
    this.filter.model = {...this.researchService.facetModel, ...entity.model};
    this.filter.fieldsWithParameters = entity.parameter;
    this.query.setValue(entity.term);
  }

  saveQuery() {
    this.dialog.open(SaveQueryDialogComponent).afterClosed()
      .subscribe(response => {
        if (response) {
          this.researchService.saveQuery({
            id: null,
            type: this.getQueryType(),
            name: response.name,
            description: response.description,
            term: this.query.value,
            model: this.filter.model,
            parameter: this.filter.fieldsWithParameters
          }).subscribe();
        }
      });
  }

  private getQueryType(): 'facet' | 'sql' {
    return this.selectedIndex === 0 ? 'facet' : 'sql';
  }

  loadDataset(uuid: string) {
    this.router.navigate(['/form', {id: uuid}]);
  }

  changeSearchClass(change: MatSelectChange) {
    this.filter.model = {};
    this.startSearch();
  }
}
