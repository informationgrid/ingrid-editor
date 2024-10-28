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
import { CodelistQuery } from "../../../../../app/store/codelist/codelist.query";
import { FormStateService } from "../../../../../app/+form/form-state.service";
import { ConfigService } from "../../../../../app/services/config/config.service";
import { KeywordAnalysis } from "../../../utils/keywords";
import { ThesaurusResult } from "../../../components/thesaurus-result";
import { removeDuplicatesByValue } from "../../../../../app/shared/utils";
import { IgeDocument, Metadata } from "../../../../../app/models/ige-document";

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
    private dialogRef: MatDialogRef<ConsolidateDialogComponent>,
    private snackBar: MatSnackBar,
    private codelistQuery: CodelistQuery,
    private formStateService: FormStateService,
    public configService: ConfigService,
    private keywordAnalysis: KeywordAnalysis,
  ) {}

  doc: IgeDocument;
  metadata: Metadata;
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
  keywordMap: any;
  isLoading: boolean;
  isSaving: boolean;

  async ngOnInit() {
    this.doc = this.formStateService.getForm().value;
    this.metadata = this.formStateService.metadata();
    const hasKeywords = this.initKeywords();
    if (!hasKeywords) {
      this.isLoading = false;
      return;
    }
    await this.consolidateKeywords();
  }

  private initKeywords() {
    this.isLoading = true;
    this.resetNewKeywords();

    const form = this.formStateService.getForm();
    this.keywords = form.get("keywords").value;

    this.isInspireIdentified = form.get("isInspireIdentified")?.value;
    this.inspireTopics = this.isInspireIdentified
      ? form.get("themes")?.value || []
      : []; // INSPIRE-Themen
    this.isoCategories = form.get("topicCategories")?.value || []; // ISO-Themenkategorie

    this.hasKeywords =
      Object.values(this.keywords).some((keywords) => keywords.length > 0) ||
      this.inspireTopics.length > 0 ||
      this.isoCategories.length > 0;

    if (!this.hasKeywords) {
      return false;
    }

    this.keywords = form.get("keywords")?.value;

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
    this.timedOutKeywords = [];
    this.timedOutThesauri = [];

    await this.keywordAnalysis
      .analyzeKeywords(
        [
          ...this.gemetKeywords,
          ...this.umthesKeywords,
          ...this.freeKeywords,
          ...this.inspireTopics.map((keyword) => ({
            label: this.codelistQuery.getCodelistEntryByKey("6100", keyword.key)
              .fields["de"],
          })),
        ].map((keyword) => keyword.label),
        this.isInspireIdentified,
      )
      .then((res) => {
        this.updateKeywords(res);
        this.addAllKeywordStatuses();

        this.sortKeywordsByStatus();
        this.removeAllDuplicateKeywords();
        this.setKeywordDialogData();
        this.isLoading = false;
      });
  }

  private updateKeywords(res) {
    this.gemetKeywordsNew = res.filter(
      (keyword) => keyword.thesaurus === this.keywordCategories.gemet,
    );
    this.umthesKeywordsNew = res.filter(
      (keyword) => keyword.thesaurus === this.keywordCategories.umthes,
    );
    this.freeKeywordsNew = res.filter(
      (keyword) => keyword.thesaurus === this.keywordCategories.free,
    );
    this.inspireTopicsNew = res.filter(
      (keyword) => keyword.thesaurus === this.keywordCategories.themes,
    );
  }

  private addAllKeywordStatuses() {
    const addStatuses = (newKeywords, oldKeywords) => {
      // newKeywords not in oldKeywords as "added"
      newKeywords.forEach((keyword) => {
        if (!oldKeywords.some((k) => k.label === keyword.label)) {
          keyword.status = "added";
        }
      });

      // oldKeywords not in newKeywords as "removed"
      oldKeywords.forEach((keyword) => {
        if (!newKeywords.some((k) => k.label === keyword.label)) {
          newKeywords.push({ ...keyword, status: "removed" });
        }
      });
    };

    addStatuses(this.gemetKeywordsNew, this.gemetKeywords);
    addStatuses(this.umthesKeywordsNew, this.umthesKeywords);
    addStatuses(this.freeKeywordsNew, this.freeKeywords);

    addStatuses(
      this.inspireTopicsNew,
      // Special handling getting label from codelist id's
      this.inspireTopics.map((keyword) => ({
        label: this.codelistQuery.getCodelistEntryByKey("6100", keyword.key)
          .fields["de"],
      })),
    );
  }

  mapAndSaveConsolidatedKeywords() {
    this.mapAllKeywords();
    this.documentService
      .save({
        id: this.metadata.wrapperId,
        version: this.metadata.version,
        data: this.doc,
        isNewDoc: false,
        isAddress: false,
      })
      .subscribe(() => {
        this.snackBar.open("Schlagworte konsolidiert", "", {
          panelClass: "green",
        });
        this.dialogRef.close("confirm");
      });
  }

  // Map ThesaurusResult keywords to format expected by the backend
  private mapAllKeywords() {
    this.doc.keywords.gemet = this.mapKeywords(
      this.gemetKeywordsNew.filter((k) => k.status !== "removed"),
    );
    this.doc.keywords.umthes = this.mapKeywords(
      this.umthesKeywordsNew.filter((k) => k.status !== "removed"),
    );
    this.doc.keywords.free = this.freeKeywordsNew
      .filter((k) => k.status !== "removed")
      .map((k) => ({ label: k.label }));

    this.doc.themes = this.inspireTopicsNew.map((k) => ({
      key: k.value.key,
    }));
    this.doc.topicCategories = this.isoCategoriesNew.map((k) => ({
      key: k.value.key,
    }));
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

  private removeAllDuplicateKeywords() {
    // Remove duplicate keywords inside the same thesaurus
    this.inspireTopicsNew = removeDuplicatesByValue(
      this.inspireTopicsNew,
      "label",
    );
    this.isoCategoriesNew = removeDuplicatesByValue(
      this.isoCategoriesNew,
      "label",
    );
    this.gemetKeywordsNew = removeDuplicatesByValue(
      this.gemetKeywordsNew,
      "label",
    );
    this.umthesKeywordsNew = removeDuplicatesByValue(
      this.umthesKeywordsNew,
      "label",
    );
    this.freeKeywordsNew = removeDuplicatesByValue(
      this.freeKeywordsNew,
      "label",
    );
    // Remove duplicate keywords between thesauri to preserve hierarchy (Gemet > Umthes > Free)
    this.umthesKeywordsNew = this.removeDuplicateKeywordsBetweenArrays(
      this.umthesKeywordsNew,
      this.gemetKeywordsNew,
    );
    this.freeKeywordsNew = this.removeDuplicateKeywordsBetweenArrays(
      this.freeKeywordsNew,
      this.gemetKeywordsNew,
    );
    this.freeKeywordsNew = this.removeDuplicateKeywordsBetweenArrays(
      this.freeKeywordsNew,
      this.umthesKeywordsNew,
    );
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
        condition: this.inspireTopicsNew.length,
        keywords: this.inspireTopicsNew,
      },
      {
        label: "ISO-Themenkategorie",
        condition: this.isoCategoriesNew.length,
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

  private removeDuplicateKeywordsBetweenArrays(
    arr1: any[],
    arr2: any[],
  ): any[] {
    return arr1.filter(
      (keyword1) =>
        !arr2.some(
          (keyword2) =>
            keyword1.status !== "removed" &&
            keyword2.status !== "removed" &&
            keyword1.label.toLowerCase() === keyword2.label.toLowerCase(),
        ),
    );
  }
}
