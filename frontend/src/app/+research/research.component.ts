import {Component, EventEmitter, OnInit} from '@angular/core';
import {ResearchResponse, ResearchService} from './research.service';
import {debounceTime, distinct, tap} from 'rxjs/operators';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {FormControl} from '@angular/forms';
import {FacetUpdate} from './+facets/facets.component';
import {QueryQuery} from '../store/query/query.query';
import {ActivatedRoute, Router} from '@angular/router';
import {SaveQueryDialogComponent} from './save-query-dialog/save-query-dialog.component';
import {FacetQuery, SqlQuery} from '../store/query/query.model';
import {MatDialog} from '@angular/material/dialog';
import {HttpErrorResponse} from '@angular/common/http';
import {ConfirmDialogComponent, ConfirmDialogData} from '../dialogs/confirm/confirm-dialog.component';
import {DocumentService} from '../services/document/document.service';
import {QueryState, QueryStore} from '../store/query/query.store';
import {ShortResultInfo} from './result-table/result-table.component';
import {logAction} from '@datorama/akita';

@UntilDestroy()
@Component({
  selector: 'ige-research',
  templateUrl: './research.component.html',
  styleUrls: ['./research.component.scss']
})
export class ResearchComponent implements OnInit {

  selectedIndex = this.queryQuery.select( state => state.ui.currentTabIndex);

  query = new FormControl('');

  totalHits: number = 0;

  searchClass: 'selectDocuments' | 'selectAddresses';

  filter: FacetUpdate;
  result: ResearchResponse;

  error: string = null;

  facetViewRefresher = new EventEmitter<void>();

  constructor(private route: ActivatedRoute,
              private router: Router,
              private dialog: MatDialog,
              private researchService: ResearchService,
              private documentService: DocumentService,
              private queryStore: QueryStore,
              private queryQuery: QueryQuery) {
  }

  ngOnInit() {
    let state = this.queryQuery.getValue();
    this.updateControlsFromState(state, this.route.snapshot.params.q, this.route.snapshot.params.type);

    this.researchService.fetchQueries();

    this.query.valueChanges
      .pipe(
        untilDestroyed(this),
        debounceTime(300),
        tap(value => {
          logAction('query changed');
          this.queryStore.update((state => ({
              ui: {
                ...state.ui,
                search: {
                  ...state.ui.search,
                  query: value
                }
              }
            }))
          )
        })
      ).subscribe();

    this.queryQuery.searchSelect$
      .pipe(
        untilDestroyed(this),
        debounceTime(200),
        distinct()
      ).subscribe((state) => this.startSearch());

    this.queryQuery.sqlSelect$
      .pipe(untilDestroyed(this))
      .subscribe(state => this.queryBySQL());

  }

  updateFilter(info: FacetUpdate) {
    logAction('Update filter');
    this.queryStore.update((state => ({
      ui: {
        ...state.ui,
        search: {
          ...state.ui.search,
          facets: info
        }
      }
    })));
  }

  startSearch() {
    const state = this.queryQuery.getValue();

    // complete model with other parameters
    const model = this.prepareFacetModel(state);

    setTimeout(() => {
      // this.applyImplicitFilter(this.model);
      return this.researchService.search(
        state.ui.search.query,
        model,
        state.ui.search.facets.fieldsWithParameters
      ).subscribe(result => this.updateHits(result));
    });
  }

  queryBySQL() {
    this.error = null;
    const sql = this.queryQuery.getValue().ui.sql.query;
    if (sql.trim() === '') {
      this.updateHits({hits: [], totalHits: 0});
      return;
    }

    this.researchService.searchBySQL(sql)
      .subscribe(
        result => this.updateHits(result),
        (error: HttpErrorResponse) => this.error = error.error.errorText
      );
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
    value: `SELECT document1.*, document_wrapper.*
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
    value: `SELECT document1.*, document_wrapper.*
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
    let entity: SqlQuery | FacetQuery = JSON.parse(JSON.stringify(this.queryQuery.getEntity(id)));

    logAction('Load query');
    if (entity.type === 'facet') {
      this.queryStore.update((state => ({
          ui: {
            ...state.ui,
            currentTabIndex: 0,
            search: {
              category: (<FacetQuery>entity).model.type,
              query: (<FacetQuery>entity).term,
              facets: {
                model: {...this.getFacetModel(), ...(<FacetQuery>entity).model},
                fieldsWithParameters: (<FacetQuery>entity).parameter
              }
            }
          }
        }))
      );
    } else {
      this.queryStore.update((state => ({
          ui: {
            ...state.ui,
            currentTabIndex: 1,
            sql: {
              query: (<SqlQuery>entity).sql
            }
          }
        }))
      );
    }

    this.updateControlsFromState(this.queryQuery.getValue())
  }

  private getFacetModel(): any {
    return this.searchClass === 'selectDocuments'
      ? this.researchService.facetModel.documents
      : this.researchService.facetModel.addresses;
  }

  saveQuery(asSql = false) {
    this.dialog.open(SaveQueryDialogComponent, {
      hasBackdrop: true,
      maxWidth: 600
    }).afterClosed()
      .subscribe(response => {
        if (response) {
          this.researchService.saveQuery(this.prepareQuery(response, asSql))
            .subscribe();
        }
      });
  }

  loadDataset(info: ShortResultInfo) {
    this.router.navigate([info.isAddress ? '/address' : '/form', {id: info.uuid}]);
  }

  changeSearchClass(value: string) {
    this.filter.model = {};

    logAction('Change search class');
    this.queryStore.update((state => ({
        ui: {
          ...state.ui,
          search: {
            ...state.ui.search,
            category: value
          }
        }
      }))
    );
  }

  private prepareQuery(response: any, asSql: boolean): SqlQuery | FacetQuery {
    const state = this.queryQuery.getValue();
    let base = {
      id: null,
      name: response.name,
      description: response.description
    };

    if (asSql) {
      return {
        ...base,
        sql: state.ui.sql.query,
        type: 'sql'
      }
    } else {
      const model = this.prepareFacetModel(state);
      return {
        ...base,
        type: 'facet',
        term: state.ui.search.query,
        model: model,
        parameter: state.ui.search.facets.fieldsWithParameters
      };
    }
  }

  removeDataset(hit: any) {
    console.log(hit);
    this.dialog.open(ConfirmDialogComponent, {
      data: <ConfirmDialogData>{
        title: 'Löschen',
        message: `Wollen Sie den Datensatz ${hit.title} wirklich löschen?`,
        buttons: [
          {text: 'Abbruch'},
          {text: 'Löschen', alignRight: true, id: 'confirm', emphasize: true}
        ]
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.documentService.delete([hit.uuid], this.isAddress(hit))
          .then(() => this.startSearch());
      }
    });
  }

  private isAddress(hit: any): boolean {

    return (hit._category === 'address');

  }

  updateSqlQueryState(value: string) {
    logAction('SQL Query');
    this.queryStore.update((state => ({
      ui: {
        ...state.ui,
        sql: {
          ...state.ui.sql,
          query: value
        }
      }
    })));
  }

  handleTabChange(index: number) {
    logAction('Tab change');
    this.queryStore.update(state => ({
      ui: {
        ...state.ui,
        currentTabIndex: index
      }
    }));
    if (index === 0) {
      this.facetViewRefresher.emit();
    }
  }

  private prepareFacetModel(state: QueryState) {
    return {
      ...state.ui.search.facets.model,
      type: state.ui.search.category
    };
  }

  private updateControlsFromState(state: QueryState, queryOverride?: string, typeOverride?: 'selectDocuments' | 'selectAddresses') {
    this.query.setValue(queryOverride ?? state.ui.search.query, {emitEvent: false});
    this.searchClass = typeOverride ?? state.ui.search.category;
    this.filter = JSON.parse(JSON.stringify(state.ui.search.facets));
  }

  startSearchByTab(index: number) {
    if (index === 0) {
      this.startSearch();
    } else if (index === 1) {
      this.queryBySQL();
    }
  }
}
