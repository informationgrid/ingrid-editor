import { Component, Inject, OnInit } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { CdkDrag, CdkDragHandle } from "@angular/cdk/drag-drop";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

import { MatSnackBar } from "@angular/material/snack-bar";
import { MatChip, MatChipListbox } from "@angular/material/chips";
import { NgClass, NgForOf, NgIf } from "@angular/common";
import { UserTableComponent } from "../../../../../app/+user/user/user-table/user-table.component";
import { DialogTemplateComponent } from "../../../../../app/shared/dialog-template/dialog-template.component";
import { DocumentService } from "../../../../../app/services/document/document.service";
import { DocumentDataService } from "../../../../../app/services/document/document-data.service";
import { CodelistQuery } from "../../../../../app/store/codelist/codelist.query";
import { FormStateService } from "../../../../../app/+form/form-state.service";
import { ConfigService } from "../../../../../app/services/config/config.service";
import { KeywordAnalysis } from "../../../utils/keywords";
import { ThesaurusResult } from "../../../components/thesaurus-result";
import { removeDuplicates } from "../../../../../app/shared/utils";

export interface ConsolidateDialogData {
  id: number;
}

class Keywords {
  gemet: Object[];
  umthes: Object[];
  free: Object[];
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
    MatProgressSpinnerModule,
    CdkDragHandle,
    MatChip,
    MatChipListbox,
    NgForOf,
    NgClass,
    NgIf,
    DialogTemplateComponent,
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
  keywords: Keywords;
  isInspireIdentified: boolean;

  keywordCategories = {
    gemet: "Gemet Schlagworte",
    umthes: "Umthes Schlagworte",
    free: "Freie Schlagworte",
    themes: "INSPIRE-Themen",
  };

  hasKeywords: boolean;

  inspireTopics: any[];
  isoCategories: any[];
  gemetKeywords: any[];
  umthesKeywords: any[];
  freeKeywords: any[];

  timedOutKeywords: string[] = [];
  timedOutThesauri: string[] = [];

  inspireTopicsNew: ThesaurusResult[] = [];
  isoCategoriesNew: ThesaurusResult[] = [];
  gemetKeywordsNew: ThesaurusResult[] = [];
  umthesKeywordsNew: ThesaurusResult[] = [];
  freeKeywordsNew: ThesaurusResult[] = [];

  keywordDialogData = [];
  isLoading: boolean;
  isSaving: boolean;

  ngOnInit() {
    const hasKeywords = this.initKeywords();
    if (!hasKeywords) {
      this.isLoading = false;
      return;
    }
    this.consolidateKeywords();
  }

  private initKeywords() {
    this.isLoading = true;
    this.resetNewKeywords();

    const form = this.formStateService.getForm();
    this.keywords = form.get("keywords").value;

    this.hasKeywords = Object.values(this.keywords).some(
      (keywords) => keywords.length > 0,
    );

    if (!this.hasKeywords) {
      return false;
    }

    this.isInspireIdentified = form.get("isInspireIdentified").value;
    this.inspireTopics = this.isInspireIdentified
      ? form.get("themes").value
      : []; // INSPIRE-Themen
    this.isoCategories = form.get("topicCategories").value || []; // ISO-Themenkategorie
    this.keywords = form.get("keywords").value;

    this.gemetKeywords = this.keywords?.gemet || [];
    this.umthesKeywords = this.keywords?.umthes || [];
    this.freeKeywords = this.keywords?.free || [];
    this.keywordMap = this.setKeywordMap();

    this.timedOutKeywords = [];
    this.timedOutThesauri = [];

    return true;
  }

  protected async consolidateKeywords() {
    this.isLoading = true;
    this.inspireTopics.forEach((theme) => this.handleInspireTopics(theme));
    this.isoCategories.forEach((category) =>
      this.handleIsoCategories(category),
    );

    await this.assignKeywords([
      ...this.gemetKeywords,
      ...this.umthesKeywords,
      ...this.freeKeywords,
    ]).then(() => {
      this.sortKeywordsByStatus();
      this.removeDuplicateKeywords();
      this.setKeywordDialogData();
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

  private async assignKeyword(keyword: ThesaurusResult) {
    let res: ThesaurusResult;
    try {
      res = await this.keywordAnalysis.assignKeyword(
        keyword.label,
        this.isInspireIdentified,
      );
    } catch (e) {
      // Thesaurus response time out
      console.error(e.message);
      if (!this.timedOutThesauri.includes(e.thesaurus)) {
        this.timedOutThesauri.push(e.thesaurus);
      }
      this.timedOutKeywords.push(keyword.label);
      res = {
        thesaurus: this.keywordCategories.free,
        value: keyword.value,
        label: keyword.label,
        found: false,
      };
    }

    switch (res.thesaurus) {
      case this.keywordCategories.themes:
        this.addInspireKeyword(res);
        break;
      case this.keywordCategories.gemet:
      case this.keywordCategories.umthes:
      case this.keywordCategories.free:
        const keywordCategory = this.keywordMap[res.thesaurus];
        if (!keywordCategory.original.some((k) => k.label === res.label)) {
          keywordCategory.new.push({ ...res, status: "added" });
        } else {
          keywordCategory.new.push({ ...res, status: "unchanged" });
        }
        break;
    }

    // Add removed status if keyword is found in other thesaurus
    [
      this.keywordCategories.gemet,
      this.keywordCategories.umthes,
      this.keywordCategories.free,
    ].forEach((thesaurus) => {
      if (
        this.keywordMap[thesaurus].original.some((k) => k.label === res.label)
      ) {
        this.keywordMap[thesaurus].new.push({ ...res, status: "removed" });
      }
    });

    // Case when keyword is found with different label in thesaurus (Kita -> Kindertagesstätte)
    if (keyword.label !== res.label) {
      this.freeKeywordsNew.push({ ...keyword, status: "unchanged" });
    } else {
      if (this.freeKeywords.some((k) => k.label === res.label)) {
        this.freeKeywordsNew.push({ ...res, status: "removed" });
      }
    }
  }

  private async assignKeywords(keywords: ThesaurusResult[]): Promise<any> {
    return Promise.all(keywords.map((keyword) => this.assignKeyword(keyword)));
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

  private setKeywordDialogData() {
    this.keywordDialogData = [
      {
        label: "INSPIRE Themen",
        condition: this.isInspireIdentified && this.inspireTopicsNew.length,
        keywords: this.inspireTopicsNew,
      },
      {
        label: "ISO-Themenkategorie",
        condition: this.isInspireIdentified && this.isoCategoriesNew.length,
        keywords: this.isoCategoriesNew,
      },
      {
        label: "Gemet Schlagworte",
        condition: this.gemetKeywordsNew.length,
        keywords: this.gemetKeywordsNew,
      },
      {
        label: "Umthes Schlagworte",
        condition: this.umthesKeywordsNew.length,
        keywords: this.umthesKeywordsNew,
      },
      {
        label: "Freie Schlagworte",
        condition: this.freeKeywordsNew.length,
        keywords: this.freeKeywordsNew,
      },
    ];
  }

  private setKeywordMap() {
    return {
      [this.keywordCategories.gemet]: {
        original: this.gemetKeywords,
        new: this.gemetKeywordsNew,
      },
      [this.keywordCategories.umthes]: {
        original: this.umthesKeywords,
        new: this.umthesKeywordsNew,
      },
      [this.keywordCategories.free]: {
        original: this.freeKeywords,
        new: this.freeKeywordsNew,
      },
    };
  }
}
