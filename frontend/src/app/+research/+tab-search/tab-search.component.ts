/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { Component, EventEmitter, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { firstValueFrom, of } from "rxjs";
import { Facets, ResearchResponse, ResearchService } from "../research.service";
import {
  catchError,
  debounceTime,
  filter,
  finalize,
  startWith,
  tap,
} from "rxjs/operators";
import { QueryQuery } from "../../store/query/query.query";
import { SaveQueryDialogComponent } from "../save-query-dialog/save-query-dialog.component";
import { ActivatedRoute } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
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

  result: ResearchResponse;

  error: string = null;
  isSearching = false;

  facetViewRefresher = new EventEmitter<void>();

  facets: Facets;
  private initialValue: any;

  constructor(
    private queryQuery: QueryQuery,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private researchService: ResearchService,
    private snackBar: MatSnackBar,
    private fb: UntypedFormBuilder,
  ) {}

  async ngOnInit() {
    this.initForm();

    await this.initFacets();

    setTimeout(() => (this.initialValue = this.form.value));

    this.form.valueChanges
      .pipe(untilDestroyed(this), startWith(""), debounceTime(300))
      .subscribe(() => this.startSearch());

    this.queryQuery
      .selectActive()
      .pipe(
        untilDestroyed(this),
        filter((a) => a && a.type === "facet"),
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
          finalize(() => setTimeout(() => (this.isSearching = false), 300)),
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
                },
              ),
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
    return firstValueFrom(
      this.researchService
        .getQuickFilter()
        .pipe(tap((filters) => (this.facets = filters))),
    );
  }

  resetSearchField() {
    this.form.reset(this.initialValue);
  }
}
