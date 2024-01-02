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
import { Component, OnInit } from "@angular/core";
import { QueryQuery } from "../../store/query/query.query";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { filter, finalize, map } from "rxjs/operators";
import { ResearchResponse, ResearchService } from "../research.service";
import { SaveQueryDialogComponent } from "../save-query-dialog/save-query-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SqlQuery } from "../../store/query/query.model";
import { FormControl, UntypedFormControl } from "@angular/forms";
import { ConfigService } from "../../services/config/config.service";

@UntilDestroy()
@Component({
  selector: "ige-tab-sql",
  templateUrl: "./tab-sql.component.html",
  styleUrls: ["./tab-sql.component.scss"],
})
export class TabSqlComponent implements OnInit {
  sql = new UntypedFormControl("");
  request = new FormControl<string>("");

  sqlExamples = this.researchService.sqlExamples;

  isSearching = false;

  result: any;
  aiSearchEnabled =
    this.config.isSuperAdmin() &&
    (this.config.getConfiguration().featureFlags.openAISearch ?? false);

  constructor(
    private queryQuery: QueryQuery,
    private researchService: ResearchService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private config: ConfigService,
  ) {}

  ngOnInit(): void {
    this.queryQuery
      .selectActive()
      .pipe(
        untilDestroyed(this),
        filter((a) => a && a.type === "sql"),
      )
      .subscribe((entity: SqlQuery) => {
        this.researchService.setActiveQuery(null);
        this.sql.setValue(entity.sql);
        this.search(entity.sql);
      });
  }

  search(sql: string) {
    // this.error = null;
    if (sql.trim() === "") {
      this.updateHits({ hits: [], totalHits: 0 });
      return;
    }
    this.isSearching = true;
    this.researchService
      .searchBySQL(sql)
      .pipe(finalize(() => (this.isSearching = false)))
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
      })
      .afterClosed()
      .subscribe((dialogOptions) => {
        if (dialogOptions) {
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
      });
  }

  updateSqlControl(value: string) {
    this.sql.setValue(value);
    this.search(value);
  }

  private updateHits(result: ResearchResponse) {
    this.result = result;
  }

  askForSQL(question: string) {
    this.isSearching = true;
    this.researchService
      .askAI(question)
      .pipe(
        finalize(() => (this.isSearching = false)),
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
      "SELECT document1.*, document_wrapper.category FROM document_wrapper JOIN document document1 ON document_wrapper.uuid=document1.uuid " +
      adaptedAnswer
    );
  }
}
