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
import { ThesaurusResult } from "../../../../../../profiles/ingrid/components/thesaurus-result";

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

  gemetKeywordsNew: ThesaurusResult[] = [];
  umthesKeywordsNew: ThesaurusResult[] = [];
  freeKeywordsNew: ThesaurusResult[] = [];
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
      if (!response.keywords) {
        this.keywords = [];
        this.isLoading = false;
        return;
      }
      this.gemetKeywords = response.keywords.gemet;
      this.umthesKeywords = response.keywords.umthes;
      this.freeKeywords = response.keywords.free;
      this.keywords = [
        ...this.gemetKeywords,
        ...this.umthesKeywords,
        ...this.freeKeywords,
      ];
      Promise.all([
        ...this.gemetKeywords.map((keyword) =>
          this.keywordAnalysis
            .checkInThesaurus(keyword.label, "gemet")
            .then((res: ThesaurusResult) => {
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
            .then((res: ThesaurusResult) => {
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
                  if (keyword.label === res.label) {
                    this.freeKeywordsNew.push({ ...res, status: "removed" });
                  } else {
                    this.freeKeywordsNew.push({
                      ...keyword,
                      status: "unchanged",
                    });
                  }
                }
                if (res.thesaurus === "Umthes Schlagworte") {
                  res["status"] = "added";
                  this.umthesKeywordsNew.push(res);
                  if (keyword.label === res.label) {
                    this.freeKeywordsNew.push({ ...res, status: "removed" });
                  } else {
                    this.freeKeywordsNew.push({
                      ...keyword,
                      status: "unchanged",
                    });
                  }
                }
                if (res.thesaurus === "Freie Schlagworte") {
                  res["status"] = "unchanged";
                  this.freeKeywordsNew.push(res);
                }
              }
            }),
        ),
      ]).then(() => {
        this.sortKeywordsByStatus();
        this.removeDuplicateKeywords();
        this.isLoading = false;
      });
    });
  }

  saveConsolidatedKeywords() {
    this.documentDataService.load(this.id, false).subscribe((doc) => {
      doc.keywords.gemet = this.mapKeywords(
        this.gemetKeywordsNew.filter((k) => k.status !== "removed"),
      );
      doc.keywords.umthes = this.mapKeywords(
        this.umthesKeywordsNew.filter((k) => k.status !== "removed"),
      );
      doc.keywords.free = this.freeKeywordsNew
        .filter((k) => k.status !== "removed")
        .map((k) => ({ label: k.label }));

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

  private mapKeywords(keywords: Object[]) {
    return keywords.map((k) => ({
      id: k["value"].id,
      label: k["value"].label,
      alternateLabel: k["value"].alternativeLabel || null,
    }));
  }
  private removeDuplicates(arr: any[], uniqueKey: string) {
    return arr.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t[uniqueKey] === item[uniqueKey]),
    );
  }

  private sortByStatus(keywords: any[]) {
    return keywords.sort((a, b) => (a.status === "removed" ? 1 : -1));
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
