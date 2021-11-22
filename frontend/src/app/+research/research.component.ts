import { Component, EventEmitter, OnInit } from "@angular/core";
import { ResearchResponse, ResearchService } from "./research.service";
import { debounceTime, distinct, tap } from "rxjs/operators";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { FormControl } from "@angular/forms";
import { FacetUpdate } from "./+facets/facets.component";
import { QueryQuery } from "../store/query/query.query";
import { ActivatedRoute, Router } from "@angular/router";
import { SaveQueryDialogComponent } from "./save-query-dialog/save-query-dialog.component";
import { FacetQuery, SqlQuery } from "../store/query/query.model";
import { MatDialog } from "@angular/material/dialog";
import { HttpErrorResponse } from "@angular/common/http";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../dialogs/confirm/confirm-dialog.component";
import { DocumentService } from "../services/document/document.service";
import { ShortResultInfo } from "./result-table/result-table.component";
import { logAction } from "@datorama/akita";
import { SessionService } from "../services/session.service";
import { MatSnackBar } from "@angular/material/snack-bar";

@UntilDestroy()
@Component({
  selector: "ige-research",
  templateUrl: "./research.component.html",
  styleUrls: ["./research.component.scss"],
})
export class ResearchComponent implements OnInit {
  selectedIndex = this.sessionService.observeTabChange("research");

  query = new FormControl("");

  searchClass: "selectDocuments" | "selectAddresses";

  facetModel: any;
  facetParameters: any;
  result: ResearchResponse;

  error: string = null;
  isSearching = false;

  facetViewRefresher = new EventEmitter<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private researchService: ResearchService,
    private documentService: DocumentService,
    private sessionService: SessionService,
    private queryQuery: QueryQuery,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    let state = this.queryQuery.getValue();
    const query = this.route.snapshot.params.q ?? state.ui.search.query;
    const type = this.route.snapshot.params.type ?? state.ui.search.category;
    this.researchService.updateUIState({
      search: { query: query, category: type },
    });
    this.updateControlsFromState();

    this.researchService.fetchQueries();

    this.query.valueChanges
      .pipe(
        untilDestroyed(this),
        debounceTime(300),
        tap((value) =>
          this.researchService.updateUIState({ search: { query: value } })
        )
      )
      .subscribe();

    this.queryQuery.searchSelect$
      .pipe(untilDestroyed(this), debounceTime(500), distinct())
      .subscribe(() => this.startSearch());

    this.queryQuery.sqlSelect$
      .pipe(untilDestroyed(this))
      .subscribe(() => this.queryBySQL());
  }

  updateFilter(info: FacetUpdate) {
    this.researchService.updateUIState({ search: { facets: info } });
  }

  startSearch() {
    this.isSearching = true;
    const state = this.queryQuery.getValue();

    // complete model with other parameters
    const model = this.researchService.prepareFacetModel(state);

    setTimeout(() => {
      // this.applyImplicitFilter(this.model);
      return this.researchService
        .search(
          state.ui.search.query,
          model,
          state.ui.search.facets.fieldsWithParameters ?? {}
        )
        .subscribe((result) => {
          this.isSearching = false;
          this.updateHits(result);
        });
    });
  }

  queryBySQL() {
    this.error = null;
    const sql = this.queryQuery.getValue().ui.sql.query;
    if (sql.trim() === "") {
      this.updateHits({ hits: [], totalHits: 0 });
      return;
    }
    this.isSearching = true;
    this.researchService
      .searchBySQL(sql)
      .pipe(tap(() => (this.isSearching = false)))
      .subscribe(
        (result) => this.updateHits(result),
        (error: HttpErrorResponse) => (this.error = error.error.errorText)
      );
  }

  loadQuery(id: string) {
    let entity: SqlQuery | FacetQuery = JSON.parse(
      JSON.stringify(this.queryQuery.getEntity(id))
    );

    logAction("Load query");
    if (entity.type === "facet") {
      this.researchService.updateUIState({
        search: {
          category: (<FacetQuery>entity).model.type,
          query: (<FacetQuery>entity).term,
          facets: {
            model: { ...this.getFacetModel(), ...(<FacetQuery>entity).model },
            fieldsWithParameters: (<FacetQuery>entity).parameter ?? {},
          },
        },
      });
      this.sessionService.updateCurrentTab("research", 0);
    } else {
      this.researchService.updateUIState({
        sqlSearch: { query: (<SqlQuery>entity).sql },
      });
      this.sessionService.updateCurrentTab("research", 1);
    }

    this.updateControlsFromState();
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

  saveQuery(asSql = false) {
    this.dialog
      .open(SaveQueryDialogComponent, {
        hasBackdrop: true,
        maxWidth: 600,
      })
      .afterClosed()
      .subscribe((dialogOptions) => {
        if (dialogOptions) {
          this.researchService
            .saveQuery(this.queryQuery.getValue(), dialogOptions, asSql)
            .subscribe(() =>
              this.snackBar.open(
                `Suche '${dialogOptions.name}' gespeichert`,
                "",
                {
                  panelClass: "green",
                }
              )
            );
        }
      });
  }

  loadDataset(info: ShortResultInfo) {
    this.router.navigate([
      info.isAddress ? "/address" : "/form",
      { id: info.uuid },
    ]);
  }

  changeSearchClass(value: string) {
    this.facetModel = {};

    this.researchService.updateUIState({
      search: {
        category: value,
        facets: {
          model: { ...this.getFacetModel() },
        },
      },
    });
  }

  removeDataset(hit: any) {
    console.log(hit);
    this.dialog
      .open(ConfirmDialogComponent, {
        data: <ConfirmDialogData>{
          title: "Löschen",
          message: `Wollen Sie den Datensatz ${hit.title} wirklich löschen?`,
          buttons: [
            { text: "Abbruch" },
            {
              text: "Löschen",
              alignRight: true,
              id: "confirm",
              emphasize: true,
            },
          ],
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.documentService
            .delete([hit.uuid], this.isAddress(hit))
            .subscribe(() => this.startSearch());
        }
      });
  }

  updateSqlQueryState(value: string) {
    logAction("SQL Query");

    this.researchService.updateUIState({
      sqlSearch: { query: value },
    });
  }

  handleTabChange(index: number) {
    logAction("Tab change");
    this.sessionService.updateCurrentTab("research", index);
    if (index === 0) {
      this.facetViewRefresher.emit();
    }
  }

  startSearchByTab(index: number) {
    if (index === 0) {
      this.startSearch();
    } else if (index === 1) {
      this.queryBySQL();
    }
  }

  private updateHits(result: ResearchResponse) {
    this.result = result;
  }

  private getFacetModel(): any {
    return this.searchClass === "selectDocuments"
      ? this.researchService.facetModel.documents
      : this.researchService.facetModel.addresses;
  }

  private isAddress(hit: any): boolean {
    return hit._category === "address";
  }

  private updateControlsFromState() {
    let state = this.queryQuery.getValue();
    this.query.setValue(state.ui.search.query, {
      emitEvent: false,
    });
    this.searchClass = state.ui.search.category;
    const filter = JSON.parse(JSON.stringify(state.ui.search.facets));
    this.facetModel = filter.model;
    this.facetParameters = filter.fieldsWithParameters;
  }
}
