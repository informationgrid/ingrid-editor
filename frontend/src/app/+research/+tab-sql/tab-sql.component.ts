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
import { MatFormField } from "@angular/material/form-field";
import { ResultTableComponent } from "../result-table/result-table.component";
import { GeneralStore } from "../../store/general.store";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { MatChipsModule } from "@angular/material/chips";
import { MatIcon } from "@angular/material/icon";
import { MatTooltip } from "@angular/material/tooltip";

@Component({
  selector: "ige-tab-sql",
  templateUrl: "./tab-sql.component.html",
  styleUrls: ["./tab-sql.component.scss"],
  imports: [
    PageTemplateComponent,
    MatButton,
    MatInput,
    ReactiveFormsModule,
    MatFormField,
    ResultTableComponent,
    MatIcon,
    MatChipsModule,
    MatTooltip,
  ],
})
export class TabSqlComponent implements OnInit {
  private generalStore = inject(GeneralStore);
  private snackBar = inject(MatSnackBar);
  private researchService = inject(ResearchService);
  private dialog = inject(MatDialog);
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
  }

  resetActiveQuery() {
    this.researchService.setActiveQuery(null);
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
          if (this.activeQuery()) {
            // Update an existing query.
            this.researchService
              .updateQuery(this.activeQuery().id, dialogOptions)
              .subscribe(() => {
                // Refresh active query.
                this.researchService.setActiveQuery(this.activeQuery().id);
                this.snackBar.open(
                  `Suche '${dialogOptions.name}' aktualisiert`,
                  "",
                  {
                    panelClass: "green",
                  },
                );
              });
          } else {
            // Create a new query.
            this.researchService
              .saveQuery(this.sql.value, dialogOptions, true)
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
        }
      });
  }

  applyExampleQuery(value: string) {
    this.resetActiveQuery();
    this.updateSqlControl(value);
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
}
