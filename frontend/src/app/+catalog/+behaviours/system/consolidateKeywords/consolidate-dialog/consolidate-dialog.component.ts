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
import { Component, Inject, OnInit } from "@angular/core";
import { DocumentService } from "../../../../../services/document/document.service";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { UserTableComponent } from "../../../../../+user/user/user-table/user-table.component";
import { CdkDrag, CdkDragHandle } from "@angular/cdk/drag-drop";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { SharedModule } from "../../../../../shared/shared.module";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

import { MatSnackBar } from "@angular/material/snack-bar";
import { ConfigService } from "../../../../../services/config/config.service";
import { MatChip, MatChipListbox } from "@angular/material/chips";
import { NgClass, NgForOf, NgIf } from "@angular/common";
import { DocumentDataService } from "../../../../../services/document/document-data.service";
import { KeywordAnalysis } from "../../../../../../profiles/ingrid/utils/keywords";

export interface ConsolidateDialogData {
  id: number;
}

@Component({
  selector: "consolidate-keywords-dialog",
  templateUrl: "./consolidate-dialog.component.html",
  styleUrls: ["./consolidate-dialog.component.scss"],
  imports: [
    UserTableComponent,
    CdkDrag,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    SharedModule,
    MatProgressSpinnerModule,
    CdkDragHandle,
    MatChip,
    MatChipListbox,
    NgForOf,
    NgClass,
    NgIf,
  ],
  standalone: true,
})
export class ConsolidateDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConsolidateDialogData,
    private documentService: DocumentService,
    private documentDataService: DocumentDataService,
    private dialogRef: MatDialogRef<ConsolidateDialogComponent>,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    public configService: ConfigService,
    private keywordAnalysis: KeywordAnalysis,
  ) {
    this.id = data.id;
  }

  id: number;
  keywords: any[];
  gemetKeywords: any[];
  umthesKeywords: any[];
  freeKeywords: any[];

  gemetKeywordsNew: any[] = [];
  umthesKeywordsNew: any[] = [];
  freeKeywordsNew: any[] = [];
  isLoading: boolean;

  ngOnInit() {
    this.consolidateKeywords();
  }

  private consolidateKeywords() {
    this.isLoading = true;
    this.gemetKeywordsNew = [];
    this.umthesKeywordsNew = [];
    this.freeKeywordsNew = [];

    this.documentDataService.load(this.id, false).subscribe((response) => {
      this.gemetKeywords = response.keywords.gemet;
      this.umthesKeywords = response.keywords.umthes;
      this.freeKeywords = response.keywords.free;

      Promise.all([
        ...this.gemetKeywords.map((keyword) =>
          this.keywordAnalysis
            .checkInThesaurus(keyword.label, "gemet")
            .then((res) => {
              if (res.found) {
                res["status"] = "unchanged";
                this.gemetKeywordsNew.push(res);
              } else {
                if (!this.freeKeywords.includes(keyword.label)) {
                  const addedRes = { ...res, status: "added" };
                  this.freeKeywordsNew.push(addedRes);

                  const removedRes = { ...res, status: "removed" };
                  this.gemetKeywordsNew.push(removedRes);
                }
              }
            }),
        ),
        ...this.umthesKeywords.map((keyword) =>
          this.keywordAnalysis
            .checkInThesaurus(keyword.label, "umthes")
            .then((res) => {
              if (res.found) {
                res["status"] = "unchanged";
                this.umthesKeywordsNew.push(res);
              } else {
                if (!this.freeKeywords.includes(keyword.label)) {
                  const addedRes = { ...res, status: "added" };
                  this.freeKeywordsNew.push(addedRes);

                  const removedRes = { ...res, status: "removed" };
                  this.umthesKeywordsNew.push(removedRes);
                }
              }
            }),
        ),
        ...this.freeKeywords.map((keyword) =>
          this.keywordAnalysis
            .assignKeyword(keyword.label, true)
            .then((res) => {
              if (res.found) {
                if (res.thesaurus === "Gemet Schlagworte") {
                  res["status"] = "added";
                  this.gemetKeywordsNew.push(res);
                }
                if (res.thesaurus === "Umthes Schlagworte") {
                  res["status"] = "added";
                  this.umthesKeywordsNew.push(res);
                }
              }
            }),
        ),
      ]).then(() => {
        this.freeKeywordsNew = [...this.freeKeywords, ...this.freeKeywordsNew];
        this.sortKeywordsByStatus();
        this.removeDuplicateKeywords();
        this.isLoading = false;
      });
      return [this.gemetKeywords, this.umthesKeywords, this.freeKeywords];
    });
  }

  saveConsolidatedKeywords() {
    this.documentDataService.load(this.id, false).subscribe((doc) => {
      doc.keywords.gemet = this.gemetKeywordsNew
        .filter((keyword) => keyword.status !== "removed")
        .map((keyword) => ({
          id: keyword.value.id,
          label: keyword.value.label,
          alternateLabel: keyword.value.alternativeLabel || null,
        }));
      doc.keywords.umthes = this.umthesKeywordsNew
        .filter((keyword) => keyword.status !== "removed")
        .map((keyword) => ({
          id: keyword.value.id,
          label: keyword.value.label,
          alternateLabel: keyword.value.alternativeLabel || null,
        }));
      doc.keywords.free = this.freeKeywordsNew
        .filter((keyword) => keyword.status !== "removed")
        .map((keyword) => ({
          label: keyword.label,
        }));

      this.documentService
        .save({ data: doc, isNewDoc: false, isAddress: false })
        .subscribe(() => {
          this.snackBar.open("Schlagworte konsolidiert", "", {
            panelClass: "green",
          });
          this.dialogRef.close("confirm");
        });
    });
  }
  private removeDuplicates(arr, uniqueKey: string) {
    if (uniqueKey) {
      return arr.filter(
        (item, index, self) =>
          index === self.findIndex((t) => t[uniqueKey] === item[uniqueKey]),
      );
    } else {
      return arr.filter(
        (item, index, self) =>
          index ===
          self.findIndex((t) => t.id === item.id && t.label === item.label),
      );
    }
  }

  sortByStatus(keywords: any): any {
    return keywords.sort((a, b) => {
      if (a.status === "removed" && b.status !== "removed") {
        return 1;
      } else if (a.status !== "removed" && b.status === "removed") {
        return -1;
      } else {
        return 0;
      }
    });
  }

  private sortKeywordsByStatus() {
    this.gemetKeywordsNew = this.sortByStatus(this.gemetKeywordsNew);
    this.umthesKeywordsNew = this.sortByStatus(this.umthesKeywordsNew);
    this.freeKeywordsNew = this.sortByStatus(this.freeKeywordsNew);
  }

  private removeDuplicateKeywords() {
    this.gemetKeywordsNew = this.removeDuplicates(
      this.gemetKeywordsNew,
      "label",
    );
    this.umthesKeywordsNew = this.removeDuplicates(
      this.umthesKeywordsNew,
      "label",
    );
    this.freeKeywordsNew = this.removeDuplicates(this.freeKeywordsNew, "label");
  }
}
