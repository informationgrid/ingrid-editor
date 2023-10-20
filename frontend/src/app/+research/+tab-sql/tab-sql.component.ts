import { Component, OnInit } from "@angular/core";
import { QueryQuery } from "../../store/query/query.query";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { filter, finalize } from "rxjs/operators";
import { ResearchResponse, ResearchService } from "../research.service";
import { SaveQueryDialogComponent } from "../save-query-dialog/save-query-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SqlQuery } from "../../store/query/query.model";
import { UntypedFormControl } from "@angular/forms";

@UntilDestroy()
@Component({
  selector: "ige-tab-sql",
  templateUrl: "./tab-sql.component.html",
  styleUrls: ["./tab-sql.component.scss"],
})
export class TabSqlComponent implements OnInit {
  sql = new UntypedFormControl("");

  sqlExamples = this.researchService.sqlExamples;

  isSearching = false;

  result: any;

  constructor(
    private queryQuery: QueryQuery,
    private researchService: ResearchService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
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
}
