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
import {HttpErrorResponse} from '@angular/common/http';
import {ConfirmDialogComponent, ConfirmDialogData} from '../dialogs/confirm/confirm-dialog.component';

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

  sqlQuery = '';

  filter: FacetUpdate = {
    model: {},
    fieldsWithParameters: {}
  };
  result: ResearchResponse;

  error: string = null;

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
        this.filter.fieldsWithParameters
      ).pipe(
        map(result => this.mapDocumentIcons(result))
      ).subscribe(result => this.updateHits(result));
    });
  }

  queryBySQL(sql: string) {
    this.error = null;

    this.researchService.searchBySQL(sql)
      .pipe(
        map(result => this.mapDocumentIcons(result))
      ).subscribe(
      result => this.updateHits(result),
      (error: HttpErrorResponse) => this.error = error.error.errorText
    );
  }

  private mapDocumentIcons(data: ResearchResponse): ResearchResponse {
    data.hits.forEach(hit => {
      hit.icon = this.profileService.getDocumentIcon(hit);
    });
    return data;
  }

  private updateHits(result: ResearchResponse) {
    this.result = result;
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
  sqlExamples = [{
    label: 'Adressen, mit Titel "test"',
    value: `SELECT document1.*, document_wrapper.draft
            FROM document_wrapper
                   JOIN document document1 ON
              CASE
                WHEN document_wrapper.draft IS NULL THEN document_wrapper.published = document1.id
                ELSE document_wrapper.draft = document1.id
                END
            WHERE document1.type = 'AddressDoc'
              AND LOWER(title) LIKE '%test%'`
  }, {
    label: 'Dokumente "Luft- und Raumfahrt"',
    value: `SELECT document1.*, document_wrapper.draft
            FROM document_wrapper
                   JOIN document document1 ON
              CASE
                WHEN document_wrapper.draft IS NULL THEN document_wrapper.published = document1.id
                ELSE document_wrapper.draft = document1.id
                END
            WHERE document1.type = 'mCloudDoc'
              AND data -> 'mCloudCategories' @> '"aviation"'`
  }];

  loadQuery(id: string) {
    let entity: Query = JSON.parse(JSON.stringify(this.queryQuery.getEntity(id)));

    if (entity.type === 'facet') {
      this.selectedIndex = 0;
      this.filter.model = {...this.getFacetModel(), ...entity.model};
      this.filter.fieldsWithParameters = {...entity.parameter};
      this.query.setValue(entity.term);
    } else {
      this.selectedIndex = 1;
      this.sqlQuery = entity.sql;
    }
  }

  private getFacetModel(): any {
    return this.searchClass === 'selectDocuments'
      ? this.researchService.facetModel.documents
      : this.researchService.facetModel.addresses;
  }

  saveQuery(data?: any, asSql = false) {
    this.dialog.open(SaveQueryDialogComponent).afterClosed()
      .subscribe(response => {
        if (response) {
          this.researchService.saveQuery(this.prepareQuery(response, data, asSql))
            .subscribe();
        }
      });
  }

  loadDataset(uuid: string) {
    this.router.navigate(['/form', {id: uuid}]);
  }

  changeSearchClass() {
    this.filter.model = {};
    this.startSearch();
  }

  private prepareQuery(response: any, data: any, asSql: boolean) {
    let base = {
      id: null,
      name: response.name,
      description: response.description
    };
    return asSql
      ? {
        ...base,
        ...data,
        type: 'sql'
      }
      : {
        ...base,
        type: 'facet',
        term: this.query.value,
        model: this.filter.model,
        parameter: this.filter.fieldsWithParameters
      };

  }

  removeDataset(uuid: string) {
    this.dialog.open(ConfirmDialogComponent, {
      data: <ConfirmDialogData>{
        title: 'Noch nicht implementiert',
        message: 'Diese Funktion ist noch nicht umgesetzt',
        buttons: [{text: 'Abbruch'}]
      }
    }).afterClosed().subscribe();
  }
}
