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
import { CodelistQuery } from "../../../../../store/codelist/codelist.query";

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
    private codelistQuery: CodelistQuery,

    public configService: ConfigService,
    private keywordAnalysis: KeywordAnalysis,
  ) {
    this.id = data.id;
  }

  id: number;
  keywords: any[];
  isInspireIdentified: boolean;

  inspireThemes: any[];
  inspireTopics: any[];
  gemetKeywords: any[];
  umthesKeywords: any[];
  freeKeywords: any[];

  inspireThemesNew: ThesaurusResult[] = [];
  inspireTopicsNew: ThesaurusResult[] = [];
  gemetKeywordsNew: ThesaurusResult[] = [];
  umthesKeywordsNew: ThesaurusResult[] = [];
  freeKeywordsNew: ThesaurusResult[] = [];
  isLoading: boolean;

  ngOnInit() {
    this.consolidateKeywords();
  }

  private consolidateKeywords() {
    this.isLoading = true;
    this.inspireThemesNew = [];
    this.inspireTopicsNew = [];
    this.gemetKeywordsNew = [];
    this.umthesKeywordsNew = [];
    this.freeKeywordsNew = [];

    this.documentDataService.load(this.id, false).subscribe((response) => {
      if (!response.keywords) {
        this.keywords = [];
        this.isLoading = false;
        return;
      }
      this.isInspireIdentified = response.isInspireIdentified;
      this.inspireThemes = response.themes;
      this.inspireTopics = response.topicCategories;

      this.gemetKeywords = response.keywords.gemet;
      this.umthesKeywords = response.keywords.umthes;
      this.freeKeywords = response.keywords.free;
      this.keywords = [
        ...this.gemetKeywords,
        ...this.umthesKeywords,
        ...this.freeKeywords,
      ];
      Promise.all([
        ...this.inspireThemes.map((theme) =>
          Promise.resolve(
            this.keywordAnalysis.checkInThemes(
              this.codelistQuery.getCodelistEntryByKey("6100", theme.key)
                .fields["de"],
            ),
          ).then((res: ThesaurusResult) => {
            if (res.found) {
              res["status"] = "unchanged";
              this.inspireThemesNew.push(res);
            }
          }),
        ),

        ...this.inspireTopics.map((topic) =>
          this.inspireTopicsNew.push({
            found: true,
            value: { key: topic.key },
            label: this.codelistQuery.getCodelistEntryByKey("527", topic.key)
              .fields["de"],
            thesaurus: "INSPIRE-Themen",
            status: "unchanged",
          }),
        ),

        ...this.gemetKeywords.map((keyword) =>
          this.keywordAnalysis
            .checkInThesaurus(keyword.label, "gemet")
            .then((res: ThesaurusResult) => {
              if (res.found) {
                res["status"] = "unchanged";
                this.gemetKeywordsNew.push(res);
              } else {
                if (!this.freeKeywords.includes(keyword.label)) {
                  this.freeKeywordsNew.push({ ...res, status: "added" });
                  this.gemetKeywordsNew.push({ ...res, status: "removed" });
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
                  this.freeKeywordsNew.push({ ...res, status: "added" });
                  this.umthesKeywordsNew.push({ ...res, status: "removed" });
                }
              }
            }),
        ),
        ...this.freeKeywords.map((keyword) =>
          this.keywordAnalysis
            .assignKeyword(keyword.label, this.isInspireIdentified)
            .then((res) => {
              if (res.found) {
                if (res.thesaurus === "INSPIRE-Themen") {
                  if (this.inspireThemes.some((t) => t.key === res.value.key)) {
                    res["status"] = "unchanged";
                  } else {
                    res["status"] = "added";
                  }
                  this.inspireThemesNew.push(res);
                  const isoKey =
                    KeywordAnalysis.inspireToIsoMapping[res.value.key];
                  const inspireTopic = this.codelistQuery.getCodelistEntryByKey(
                    "527",
                    isoKey,
                  );

                  const inspireTopicAlreadyExists = this.inspireTopics.some(
                    (t) => t.key === isoKey,
                  );

                  const inspireTopicResult: ThesaurusResult = {
                    found: true,
                    value: { key: isoKey },
                    label: inspireTopic.fields["de"],
                    thesaurus: "INSPIRE-Themen",
                    status: inspireTopicAlreadyExists ? "unchanged" : "added",
                  };
                  this.inspireTopicsNew.push(inspireTopicResult);
                  this.freeKeywordsNew.push({ ...res, status: "removed" });
                }
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
        this.inspireThemesNew.map((k) => ({
          key: KeywordAnalysis.inspireToIsoMapping[k.value.key],
        }));
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

      doc.themes = this.inspireThemesNew.map((k) => ({
        key: k.value.key,
      }));
      doc.topicCategories = [
        ...this.inspireThemesNew.map((k) => ({
          key: KeywordAnalysis.inspireToIsoMapping[k.value.key],
        })),
        ...this.inspireThemes,
      ];

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

  private mapKeywords(keywords: ThesaurusResult[]) {
    return keywords.map((k) => ({
      id: k.value.id,
      label: k.value.label,
      alternateLabel: k.value.alternativeLabel || null,
    }));
  }
  private removeDuplicates(arr: any[], uniqueKey: string) {
    return arr.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t[uniqueKey] === item[uniqueKey]),
    );
  }

  private sortByStatus(keywords: ThesaurusResult[]) {
    return keywords.sort((a) => (a.status === "removed" ? 1 : -1));
  }

  private sortKeywordsByStatus() {
    this.inspireThemesNew = this.sortByStatus(this.inspireThemesNew);
    this.inspireTopicsNew = this.sortByStatus(this.inspireTopicsNew);
    this.gemetKeywordsNew = this.sortByStatus(this.gemetKeywordsNew);
    this.umthesKeywordsNew = this.sortByStatus(this.umthesKeywordsNew);
    this.freeKeywordsNew = this.sortByStatus(this.freeKeywordsNew);
  }

  private removeDuplicateKeywords() {
    this.inspireThemesNew = this.removeDuplicates(
      this.inspireThemesNew,
      "label",
    );

    this.inspireTopicsNew = this.removeDuplicates(
      this.inspireTopicsNew,
      "label",
    );

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
