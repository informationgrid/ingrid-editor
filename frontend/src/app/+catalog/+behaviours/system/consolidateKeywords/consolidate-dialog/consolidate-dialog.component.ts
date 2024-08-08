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
import { FormStateService } from "../../../../../+form/form-state.service";
import { removeDuplicates } from "../../../../../shared/utils";

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
    private formStateService: FormStateService,
    public configService: ConfigService,
    private keywordAnalysis: KeywordAnalysis,
  ) {
    this.id = data.id;
  }

  id: number;
  form: any;
  keywords: any[];
  isInspireIdentified: boolean;

  inspireTopics: any[];
  isoCategories: any[];
  gemetKeywords: any[];
  umthesKeywords: any[];
  freeKeywords: any[];

  inspireTopicsNew: ThesaurusResult[] = [];
  isoCategoriesNew: ThesaurusResult[] = [];
  gemetKeywordsNew: ThesaurusResult[] = [];
  umthesKeywordsNew: ThesaurusResult[] = [];
  freeKeywordsNew: ThesaurusResult[] = [];
  isLoading: boolean;
  saveButtonClicked: boolean;

  ngOnInit() {
    this.consolidateKeywords();
  }

  private consolidateKeywords() {
    this.isLoading = true;

    this.resetNewKeywords();
    this.form = this.formStateService.getForm().value;
    this.keywords = this.form.keywords;
    if (!this.keywords) {
      this.isLoading = false;
      return;
    }

    this.isInspireIdentified = this.form.isInspireIdentified;
    this.inspireTopics = this.isInspireIdentified ? this.form.themes : [];
    this.isoCategories = this.form.topicCategories || [];

    this.gemetKeywords = this.form.keywords.gemet;
    this.umthesKeywords = this.form.keywords.umthes;
    this.freeKeywords = this.form.keywords.free;
    this.keywords = [
      ...this.inspireTopics,
      ...this.isoCategories,
      ...this.gemetKeywords,
      ...this.umthesKeywords,
      ...this.freeKeywords,
    ];

    this.inspireTopics.map((theme) => this.handleInspireTopics(theme));
    this.isoCategories.map((category) => this.handleIsoCategories(category));

    Promise.all([
      ...this.gemetKeywords.map((keyword) => this.handleGemetKeyword(keyword)),
      ...this.umthesKeywords.map((keyword) =>
        this.handleUmthesKeyword(keyword),
      ),
      ...this.freeKeywords.map((keyword) => this.handleFreeKeyword(keyword)),
    ]).then(() => {
      this.sortKeywordsByStatus();
      this.removeDuplicateKeywords();
      this.isLoading = false;
    });
  }

  private handleInspireTopics(theme: { key: string }) {
    const res = this.keywordAnalysis.checkInThemes(
      this.codelistQuery.getCodelistEntryByKey("6100", theme.key).fields["de"],
    );
    if (res.found) {
      this.inspireTopicsNew.push({ ...res, status: "unchanged" });
    } else {
      // TODO:
      // this.inspireTopicsNew.push({ ...res, status: "removed" });
    }
  }

  private handleIsoCategories(topic: { key: string }) {
    this.isoCategoriesNew.push({
      found: true,
      value: { key: topic.key },
      label: this.codelistQuery.getCodelistEntryByKey("527", topic.key).fields[
        "de"
      ],
      thesaurus: "INSPIRE-Themen",
      status: "unchanged",
    });
  }

  private async handleGemetKeyword(keyword: { label: string }) {
    const res = await this.keywordAnalysis.checkInThesaurus(
      keyword.label,
      "gemet",
    );
    if (res.found) {
      this.gemetKeywordsNew.push({ ...res, status: "unchanged" });
    } else {
      if (!this.freeKeywords.includes(keyword.label)) {
        this.freeKeywordsNew.push({ ...res, status: "added" });
        this.gemetKeywordsNew.push({ ...res, status: "removed" });
      }
    }
  }

  private async handleUmthesKeyword(keyword: { label: string }) {
    const res = await this.keywordAnalysis.checkInThesaurus(
      keyword.label,
      "umthes",
    );
    if (res.found) {
      this.umthesKeywordsNew.push({ ...res, status: "unchanged" });
    } else {
      if (!this.freeKeywords.includes(keyword.label)) {
        this.freeKeywordsNew.push({ ...res, status: "added" });
        this.umthesKeywordsNew.push({ ...res, status: "removed" });
      }
    }
  }

  private async handleFreeKeyword(keyword: ThesaurusResult) {
    await this.keywordAnalysis
      .assignKeyword(keyword.label, this.isInspireIdentified)
      .then((res) => {
        if (res.thesaurus === "INSPIRE-Themen") {
          this.addInspireKeyword(res);
        } else if (res.thesaurus === "Gemet Schlagworte") {
          if (!this.gemetKeywords.some((k) => k.label === res.label)) {
            this.gemetKeywordsNew.push({ ...res, status: "added" });
          }
        } else if (res.thesaurus === "Umthes Schlagworte") {
          if (!this.umthesKeywords.some((k) => k.label === res.label)) {
            this.umthesKeywordsNew.push({ ...res, status: "added" });
          }
        } else if (res.thesaurus === "Freie Schlagworte") {
          this.freeKeywordsNew.push({ ...res, status: "unchanged" });
          return;
        }
        // Case when keyword is found with different label in thesaurus (Kita -> Kindertagesstätte)
        if (keyword.label !== res.label) {
          this.freeKeywordsNew.push({ ...keyword, status: "unchanged" });
        } else {
          this.freeKeywordsNew.push({ ...res, status: "removed" });
        }
      });
  }

  private addInspireKeyword(res: ThesaurusResult) {
    if (!this.inspireTopics.some((t) => t.key === res.value.key)) {
      this.inspireTopicsNew.push({ ...res, status: "added" });
    } else {
      this.inspireTopicsNew.push({ ...res, status: "unchanged" });
    }

    // Add connected INSPIRE topic category
    const isoKey = KeywordAnalysis.inspireToIsoMapping[res.value.key]; // INSPIRE topic key
    const isoCategoryCodeListEntry = this.codelistQuery.getCodelistEntryByKey(
      "527",
      isoKey,
    );
    const isoCategory: ThesaurusResult = {
      found: true,
      value: { key: isoKey },
      label: isoCategoryCodeListEntry.fields["de"],
      thesaurus: "INSPIRE-Themen",
      status: this.isoCategories.some((t) => t.key === isoKey)
        ? "unchanged"
        : "added",
    };

    this.isoCategoriesNew.push(isoCategory);
    this.freeKeywordsNew.push({ ...res, status: "removed" });
  }

  saveConsolidatedKeywords() {
    this.documentDataService.load(this.id, false).subscribe((doc) => {
      doc.document.keywords.gemet = this.mapKeywords(
        this.gemetKeywordsNew.filter((k) => k.status !== "removed"),
      );
      doc.document.keywords.umthes = this.mapKeywords(
        this.umthesKeywordsNew.filter((k) => k.status !== "removed"),
      );
      doc.document.keywords.free = this.freeKeywordsNew
        .filter((k) => k.status !== "removed")
        .map((k) => ({ label: k.label }));

      doc.document.themes = this.inspireTopicsNew.map((k) => ({
        key: k.value.key,
      }));
      doc.document.topicCategories = this.isoCategoriesNew.map((k) => ({
        key: k.value.key,
      }));

      this.documentService
        .save({
          id: this.id,
          version: doc.metadata.version, // TODO: Do I need to increment version ??
          data: doc.document,
          isNewDoc: false,
          isAddress: false,
        })
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

  private sortByStatus(keywords: ThesaurusResult[]) {
    return keywords.sort((a, b) => {
      const order = { unchanged: 0, undefined: 0, "": 0, added: 1, removed: 2 };
      return order[a.status] - order[b.status];
    });
  }

  private sortKeywordsByStatus() {
    this.inspireTopicsNew = this.sortByStatus(this.inspireTopicsNew);
    this.isoCategoriesNew = this.sortByStatus(this.isoCategoriesNew);
    this.gemetKeywordsNew = this.sortByStatus(this.gemetKeywordsNew);
    this.umthesKeywordsNew = this.sortByStatus(this.umthesKeywordsNew);
    this.freeKeywordsNew = this.sortByStatus(this.freeKeywordsNew);
  }

  private removeDuplicateKeywords() {
    this.inspireTopicsNew = removeDuplicates(this.inspireTopicsNew, "label");
    this.isoCategoriesNew = removeDuplicates(this.isoCategoriesNew, "label");
    this.gemetKeywordsNew = removeDuplicates(this.gemetKeywordsNew, "label");
    this.umthesKeywordsNew = removeDuplicates(this.umthesKeywordsNew, "label");
    this.freeKeywordsNew = removeDuplicates(this.freeKeywordsNew, "label");
  }

  private resetNewKeywords() {
    this.inspireTopicsNew = [];
    this.isoCategoriesNew = [];
    this.gemetKeywordsNew = [];
    this.umthesKeywordsNew = [];
    this.freeKeywordsNew = [];
  }
}
