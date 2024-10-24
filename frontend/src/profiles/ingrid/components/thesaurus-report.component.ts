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
import { Component, inject, OnInit } from "@angular/core";
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarAction,
  MatSnackBarActions,
  MatSnackBarRef,
} from "@angular/material/snack-bar";
import { groupBy } from "../../../app/shared/utils";
import { ThesaurusResult } from "./thesaurus-result";
import { MatIcon } from "@angular/material/icon";
import { MatButton } from "@angular/material/button";

@Component({
  template: `
    <div class="display-flex flex-row">
      <mat-icon class="success-color" style="margin-right: 12px"
        >check_circle_outline</mat-icon
      >
      <span
        >Die Schlagwörter wurden zugeordnet.
        @for (item of report; track item) {
          <div>
            {{ item }}
          </div>
        }
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
  standalone: true,
  imports: [MatIcon, MatSnackBarActions, MatButton, MatSnackBarAction],
})
export class ThesaurusReportComponent implements OnInit {
  snackBarRef = inject(MatSnackBarRef);
  private data: ThesaurusResult[] = inject(MAT_SNACK_BAR_DATA);
  report: string[];

  ngOnInit(): void {
    const groupedByThesaurus = groupBy(this.data, (i) => i.thesaurus);

    this.report = Object.keys(groupedByThesaurus)
      .filter((key) => groupedByThesaurus[key].length > 0)
      .map((key) => {
        const report = groupedByThesaurus[key]
          .map(
            (item: ThesaurusResult) =>
              `${item.label}${
                item.alreadyExists ? " (bereits vorhanden)" : ""
              }`,
          )
          .join(", ");
        return `${key}: ${report}`;
      });
  }
}
