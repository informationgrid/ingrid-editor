import { Component, EventEmitter, OnInit } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
} from "@angular/forms";
import { of } from "rxjs";
import { Facets, ResearchResponse, ResearchService } from "../research.service";
import {
  catchError,
  debounceTime,
  filter,
  finalize,
  tap,
} from "rxjs/operators";
import { QueryQuery } from "../../store/query/query.query";
import { SaveQueryDialogComponent } from "../save-query-dialog/save-query-dialog.component";
import { ActivatedRoute } from "@angular/router";
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { MatLegacySnackBar as MatSnackBar } from "@angular/material/legacy-snack-bar";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { FacetQuery } from "../../store/query/query.model";

@UntilDestroy()
@Component({
  selector: "ige-tab-search",
  templateUrl: "./tab-search.component.html",
  styleUrls: ["./tab-search.component.scss"],
})
export class TabSearchComponent implements OnInit {
  form: UntypedFormGroup;
  query = new UntypedFormControl("");

  result: ResearchResponse;

  error: string = null;
  isSearching = false;

  facetViewRefresher = new EventEmitter<void>();

  facets: Facets;

  constructor(
    private queryQuery: QueryQuery,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private researchService: ResearchService,
    private snackBar: MatSnackBar,
    private fb: UntypedFormBuilder
  ) {}

  async ngOnInit() {
    this.initForm();

    await this.initFacets();

    this.form.valueChanges
      .pipe(untilDestroyed(this), debounceTime(300))
      .subscribe(() => this.startSearch());

    this.queryQuery
      .selectActive()
      .pipe(
        untilDestroyed(this),
        filter((a) => a && a.type === "facet")
      )
      .subscribe((entity: FacetQuery) => {
        this.researchService.setActiveQuery(null);
        // add a little delay in case facet component is still initializing (coming from saved searches)
        // so we get the correct value before search is started
        setTimeout(() => this.form.setValue(entity.model));
      });
  }

  startSearch() {
    this.isSearching = true;
    const model = this.form.value;

    setTimeout(() => {
      return this.researchService
        .search(model.query, { type: model.type, ...model.facets })
        .pipe(
          catchError((err) => this.handleSearchError(err)),
          // signal end of search but make sure spinner is shown for a tiny bit at least (good for tests and prevents flicker)
          finalize(() => setTimeout(() => (this.isSearching = false), 300))
        )
        .subscribe((result) => this.updateHits(result));
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
            .saveQuery(this.form.value, dialogOptions, false)
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

  private handleSearchError(err) {
    console.warn("Error during search", err);
    return of({ totalHits: 0, hits: [] });
  }

  private updateHits(result: ResearchResponse) {
    this.result = result;
  }

  private initForm() {
    this.form = this.fb.group({
      type: [],
      query: [],
      facets: [],
    });

    this.route.params.subscribe((data) => {
      this.form.setValue({
        type: data.type ?? "selectDocuments",
        query: data.q ?? "",
        facets: null,
      });
    });
  }

  private async initFacets() {
    return this.researchService
      .getQuickFilter()
      .pipe(tap((filters) => (this.facets = filters)))
      .toPromise();
  }

  resetSearchField() {
    this.form.controls["query"].setValue("");
  }
}
