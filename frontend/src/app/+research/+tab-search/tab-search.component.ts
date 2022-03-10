import { Component, EventEmitter, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { of, Subject } from "rxjs";
import { Facets, ResearchResponse, ResearchService } from "../research.service";
import { FacetUpdate } from "../+facets/facets.component";
import {
  catchError,
  debounceTime,
  distinct,
  filter,
  finalize,
  tap,
} from "rxjs/operators";
import { QueryQuery } from "../../store/query/query.query";
import { SaveQueryDialogComponent } from "../save-query-dialog/save-query-dialog.component";
import { ShortResultInfo } from "../result-table/result-table.component";
import { IgeDocument } from "../../models/ige-document";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../dialogs/confirm/confirm-dialog.component";
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { DocumentService } from "../../services/document/document.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { SessionService } from "../../services/session.service";

@UntilDestroy()
@Component({
  selector: "ige-tab-search",
  templateUrl: "./tab-search.component.html",
  styleUrls: ["./tab-search.component.scss"],
})
export class TabSearchComponent implements OnInit {
  form: FormGroup;
  query = new FormControl("");

  facetModel: any;
  facetParameters: any;
  facetInitialized = new Subject<boolean>();
  result: ResearchResponse;

  error: string = null;
  isSearching = false;

  facetViewRefresher = new EventEmitter<void>();

  // fields needed for recovering pagination when revisiting research page
  pageIndex = 0;
  private initialPage: number;
  facets: Facets;

  constructor(
    private queryQuery: QueryQuery,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private researchService: ResearchService,
    private documentService: DocumentService,
    private sessionService: SessionService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {}

  async ngOnInit() {
    this.initForm();
    let state = this.queryQuery.getValue();
    const query = this.route.snapshot.params.q ?? state.ui.search.query;
    const type = this.route.snapshot.params.type ?? state.ui.search.category;

    this.researchService.updateUIState({
      search: { query: query, category: type },
    });

    this.form.valueChanges
      .pipe(untilDestroyed(this), debounceTime(300))
      .subscribe(() => this.startSearch());

    /*this.query.valueChanges
      .pipe(
        untilDestroyed(this),
        debounceTime(300),
        tap((value) =>
          this.researchService.updateUIState({search: {query: value}})
        )
      )
      .subscribe();
*/
    await this.initFacets();
    this.queryQuery.searchSelect$
      .pipe(
        untilDestroyed(this),
        filter((a) => a[0]),
        debounceTime(500),
        distinct()
      )
      .subscribe(() => {
        this.updateControlsFromState();
        this.startSearch();
      });
  }

  private updateControlsFromState() {
    let state = this.queryQuery.getValue();
    this.query.setValue(state.ui.search.query, {
      emitEvent: false,
    });
    this.form.get("type").setValue(state.ui.search.category);
    const filter = JSON.parse(JSON.stringify(state.ui.search.facets));
    this.facetModel = filter.model;
    this.facetParameters = filter.fieldsWithParameters;
  }

  updateFilter(info: FacetUpdate) {
    this.researchService.updateUIState({ search: { facets: info } });
  }

  startSearch() {
    this.isSearching = true;
    const state1 = this.form.value;
    const state = this.queryQuery.getValue();

    console.log("Query state", state);

    // complete model with other parameters
    const model = state; // this.researchService.prepareFacetModel(state);

    setTimeout(() => {
      return this.researchService
        .search(state1.query, { type: state1.type, ...state1.facets })
        .pipe(
          catchError((err) => this.handleSearchError(err)),
          // signal end of search but make sure spinner is shown for a tiny bit at least (good for tests and prevents flicker)
          finalize(() => setTimeout(() => (this.isSearching = false), 300))
        )
        .subscribe((result) => this.updateHits(result));
    });
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

  saveQuery() {
    this.dialog
      .open(SaveQueryDialogComponent, {
        hasBackdrop: true,
        maxWidth: 600,
      })
      .afterClosed()
      .subscribe((dialogOptions) => {
        if (dialogOptions) {
          this.researchService
            .saveQuery(this.queryQuery.getValue(), dialogOptions, false)
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

  private isAddress(hit: any): boolean {
    return hit._category === "address";
  }

  private getFacetModel(): any {
    return this.form.get("type").value === "selectDocuments"
      ? this.researchService.facetModel.documents
      : this.researchService.facetModel.addresses;
  }

  private handleSearchError(err) {
    console.warn("Error during search", err);
    return of({ totalHits: 0, hits: [] });
  }

  private updateHits(result: ResearchResponse) {
    this.result = result;

    // update page if we come back to research page
    if (this.initialPage !== null) {
      this.pageIndex = this.initialPage;
      this.initialPage = null;
    }
  }
  removeDataset(hit: IgeDocument) {
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
            .delete([hit._id], this.isAddress(hit))
            .subscribe(() => this.startSearch());
        }
      });
  }

  private initForm() {
    this.form = this.fb.group({
      type: ["selectDocuments"],
      query: [],
      facets: [],
    });
  }

  private async initFacets() {
    return this.researchService
      .getQuickFilter()
      .pipe(
        tap((filters) => (this.facets = filters)),
        // tap(() => this.updateFilterGroup()),
        tap(() => {
          // this.isInitialized.next(true);
          // this.updateSpatialFromModel(this._parameter);
        })
      )
      .toPromise();
  }
}
