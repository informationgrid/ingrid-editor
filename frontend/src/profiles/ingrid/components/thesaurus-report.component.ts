import { Component, inject, OnInit } from "@angular/core";
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarRef,
} from "@angular/material/snack-bar";
import { groupBy } from "../../../app/shared/utils";
import { ThesaurusResult } from "./thesaurus-result";

@Component({
  template: `
    <div class="display-flex flex-row">
      <span
        >Die Schlagwörter wurden wie folgt zugeordnet:
        <div *ngFor="let item of report">
          {{ item }}
        </div>
      </span>
      <span matSnackBarActions>
        <button
          mat-button
          matSnackBarAction
          (click)="snackBarRef.dismissWithAction()"
        >
          Ok
        </button>
      </span>
    </div>
  `,
})
export class ThesaurusReportComponent implements OnInit {
  snackBarRef = inject(MatSnackBarRef);
  private data: ThesaurusResult[] = inject(MAT_SNACK_BAR_DATA);
  report: string[];

  ngOnInit(): void {
    const groupedByThesaurus = groupBy(this.data, (i) => i.thesaurus);
    let message: string[] = [];

    this.report = Object.keys(groupedByThesaurus)
      .filter((key) => groupedByThesaurus[key].length > 0)
      .map((key) => {
        const report = groupedByThesaurus[key]
          .map(
            (item) =>
              `${item.value}${item.alreadyExists ? " (bereits vorhanden)" : ""}`
          )
          .join(", ");
        return `${key}: ${report}`;
      });
  }
}
