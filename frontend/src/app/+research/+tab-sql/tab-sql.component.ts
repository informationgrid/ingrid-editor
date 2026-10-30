/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { filter, finalize, map } from "rxjs/operators";
import { ResearchResponse, ResearchService } from "../research.service";
import { SaveQueryDialogComponent } from "../save-query-dialog/save-query-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Query, SqlQuery } from "../../store/query/query.model";
import {
  FormControl,
  ReactiveFormsModule,
  UntypedFormControl,
} from "@angular/forms";
import { ConfigService } from "../../services/config/config.service";
import { PageTemplateComponent } from "../../shared/page-template/page-template.component";
import { MatButton } from "@angular/material/button";
import { MatInput } from "@angular/material/input";
import { MatFormField, MatHint } from "@angular/material/form-field";
import { ResultTableComponent } from "../result-table/result-table.component";
import { GeneralStore } from "../../store/general.store";
import {
  takeUntilDestroyed,
  toObservable,
  toSignal,
} from "@angular/core/rxjs-interop";
import { NavigationEnd, Router } from "@angular/router";

@Component({
  selector: "ige-tab-sql",
  templateUrl: "./tab-sql.component.html",
  styleUrls: ["./tab-sql.component.scss"],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    PageTemplateComponent,
    MatButton,
    MatInput,
    ReactiveFormsModule,
    MatFormField,
    MatHint,
    ResultTableComponent,
  ],
})
export class TabSqlComponent implements OnInit {
  private generalStore = inject(GeneralStore);
  private snackBar = inject(MatSnackBar);
  private researchService = inject(ResearchService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private config = inject(ConfigService);
  private destroyRef = inject(DestroyRef);

  sql = new UntypedFormControl("");
  request = new FormControl<string>("");

  sqlExamples = this.researchService.sqlExamples;

  isSearching = signal<boolean>(false);

  result = signal<any>(null);
  aiSearchEnabled = computed(
    () =>
      this.config.hasSuperAdminRights() &&
      (this.config.getConfiguration().featureFlags.openAISearch ?? false),
  );

  activeQuery = this.generalStore.activeQuery;
  private activeQuery$ = toObservable(this.activeQuery);

  // Observe modifications of sql input from the active query.
  private sqlValue = toSignal(this.sql.valueChanges, {
    initialValue: this.sql.value,
  });
  isSqlQueryChanged = computed(
    () => this.sqlValue() !== (<SqlQuery>this.activeQuery())?.sql,
  );

  ngOnInit(): void {
    this.activeQuery$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((a) => a && a.type === "sql"),
      )
      .subscribe((entity: Query) => {
        this.sql.setValue((<SqlQuery>entity).sql);
        this.search((<SqlQuery>entity).sql);
      });

    // Clear sql input when navigating away from the SQL tab.
    this.router.events
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((event) => event instanceof NavigationEnd),
      )
      .subscribe((event) => {
        if (event.url.includes("research/sql")) return;
        if (this.isQueryEmpty) return;
        this.clearQuery();
      });
  }

  search(sql: string) {
    // this.error = null;
    if (sql.trim() === "") {
      this.updateHits({ hits: [], totalHits: 0 });
      return;
    }
    this.isSearching.set(true);
    this.researchService
      .searchBySQL(sql)
      .pipe(finalize(() => this.isSearching.set(false)))
      .subscribe(
        (result) => this.updateHits(result),
        // (error: HttpErrorResponse) => (this.error = error.error.errorText)
      );
  }

  saveQuery() {
    this.dialog
      .open(SaveQueryDialogComponent, {
        hasBackdrop: true,
        maxWidth: 600,
        data: this.activeQuery(),
      })
      .afterClosed()
      .subscribe((dialogOptions) => {
        if (dialogOptions) {
          this.researchService
            .saveQuery(this.sql.value, dialogOptions, true)
            .subscribe((query) => {
              // Switch the active query to the newly saved query.
              this.researchService.setActiveQuery(query.id);

              // Notify the user that the query was saved.
              this.snackBar.open(
                `Suche '${dialogOptions.name}' gespeichert`,
                "",
                {
                  panelClass: "green",
                },
              );
            });
        }
      });
  }

  applyExampleQuery(value: string) {
    this.researchService.setActiveQuery(null);
    this.updateSqlControl(value);
  }

  clearQuery() {
    this.researchService.setActiveQuery(null);
    this.updateSqlControl("");
  }

  updateSqlControl(value: string) {
    this.sql.setValue(value);
    this.search(value);
  }

  private updateHits(result: ResearchResponse) {
    this.result.set(result);
  }

  askForSQL(question: string) {
    this.isSearching.set(true);
    this.researchService
      .askAI(question)
      .pipe(
        finalize(() => this.isSearching.set(false)),
        map((answer) => this.adaptAnswer(answer)),
      )
      .subscribe((answer) => {
        this.sql.setValue(answer);
        this.search(answer);
      });
  }

  private adaptAnswer(answer: string) {
    const start = answer.indexOf("WHERE");
    const end = answer.indexOf("```", start);
    let adaptedAnswer =
      start === -1
        ? ""
        : end === -1
          ? answer.substring(start)
          : answer.substring(start, end);
    return (
      "SELECT document1.* FROM document_wrapper JOIN document document1 ON document_wrapper.uuid=document1.uuid " +
      adaptedAnswer.replace(";", "")
    );
  }

  private get isQueryEmpty() {
    return this.sqlValue() == "" && this.activeQuery() == null;
  }
}
