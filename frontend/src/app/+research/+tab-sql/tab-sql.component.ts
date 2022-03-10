import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { QueryQuery } from "../../store/query/query.query";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { filter, tap } from "rxjs/operators";
import { HttpErrorResponse } from "@angular/common/http";
import { logAction } from "@datorama/akita";
import { ResearchResponse, ResearchService } from "../research.service";
import { SaveQueryDialogComponent } from "../save-query-dialog/save-query-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";

@UntilDestroy()
@Component({
  selector: "ige-tab-sql",
  templateUrl: "./tab-sql.component.html",
  styleUrls: ["./tab-sql.component.scss"],
})
export class TabSqlComponent implements OnInit {
  sql: string;

  sqlExamples = [
    {
      label: 'Adressen, mit Titel "test"',
      value: `SELECT document1.*, document_wrapper.*
            FROM document_wrapper
                   JOIN document document1 ON
              CASE
                WHEN document_wrapper.draft IS NULL THEN document_wrapper.published = document1.id
                ELSE document_wrapper.draft = document1.id
                END
            WHERE document_wrapper.category = 'address'
              AND LOWER(title) LIKE '%test%'`,
    },
    {
      label: 'Dokumente "Luft- und Raumfahrt"',
      value: `SELECT document1.*, document_wrapper.*
            FROM document_wrapper
                   JOIN document document1 ON
              CASE
                WHEN document_wrapper.draft IS NULL THEN document_wrapper.published = document1.id
                ELSE document_wrapper.draft = document1.id
                END
            WHERE document1.type = 'mCloudDoc'
              AND data -> 'mCloudCategories' @> '"aviation"'`,
    },
  ];

  isSearching = false;
  result: any;

  constructor(
    private queryQuery: QueryQuery,
    private researchService: ResearchService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // init to last session state
    const state = this.queryQuery.getValue().ui.sql;
    this.sql = state.query;

    this.queryQuery.sqlSelect$.pipe(untilDestroyed(this)).subscribe((state) => {
      this.sql = state.query;
      this.queryBySQL();
    });

    // has been integrated in above subscription
    /*this.queryQuery.sqlSelect$
      .pipe(
        untilDestroyed(this),
        filter(() => this.sessionService.getCurrentTab("research") === 1)
      )
      .subscribe(() => this.queryBySQL());*/
  }

  queryBySQL() {
    // this.error = null;
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
        (result) => this.updateHits(result)
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
            .saveQuery(this.queryQuery.getValue(), dialogOptions, true)
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

  updateSqlQueryState(value: string) {
    logAction("SQL Query");

    this.researchService.updateUIState({
      sqlSearch: { query: value },
    });
  }

  private updateHits(result: ResearchResponse) {
    this.result = result;

    /*    // update page if we come back to research page
    if (this.initialPage !== null) {
      this.pageIndex = this.initialPage;
      this.initialPage = null;
    }*/
  }
}
