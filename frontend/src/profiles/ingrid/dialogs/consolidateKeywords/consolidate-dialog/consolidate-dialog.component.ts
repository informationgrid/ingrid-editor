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

import { MatChip, MatChipListbox } from "@angular/material/chips";
import { NgClass, NgForOf, NgIf } from "@angular/common";
import { UserTableComponent } from "../../../../../app/+user/user/user-table/user-table.component";
import { DialogTemplateComponent } from "../../../../../app/shared/dialog-template/dialog-template.component";
import { CodelistQuery } from "../../../../../app/store/codelist/codelist.query";
import { FormStateService } from "../../../../../app/+form/form-state.service";
import { ConfigService } from "../../../../../app/services/config/config.service";
import { KeywordAnalysis } from "../../../utils/keywords";
import { ThesaurusResult } from "../../../components/thesaurus-result";
import { removeDuplicatesByValue } from "../../../../../app/shared/utils";
import { IgeDocument, Metadata } from "../../../../../app/models/ige-document";
import { UntypedFormGroup } from "@angular/forms";

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
    private dialogRef: MatDialogRef<ConsolidateDialogComponent>,
    private codelistQuery: CodelistQuery,
    private formStateService: FormStateService,
    public configService: ConfigService,
    private keywordAnalysis: KeywordAnalysis,
  ) {}

  doc: IgeDocument;
  form: UntypedFormGroup;
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

  inspireTopics: any[] = [];
  isoCategories: any[] = [];
  gemetKeywords: any[] = [];
  umthesKeywords: any[] = [];
  freeKeywords: any[] = [];

  timedOutKeywords: string[] = [];
  timedOutThesauri: string[] = [];

  inspireTopicsNew: ThesaurusResult[] = [];
  isoCategoriesNew: ThesaurusResult[] = [];
  gemetKeywordsNew: ThesaurusResult[] = [];
  umthesKeywordsNew: ThesaurusResult[] = [];
  freeKeywordsNew: ThesaurusResult[] = [];

  keywordHierarchy = [
    this.inspireTopicsNew,
    this.gemetKeywordsNew,
    this.umthesKeywordsNew,
    this.freeKeywordsNew,
  ];

  keywordMapping = {
    original: {
      [this.keywordCategories.gemet]: this.gemetKeywords,
      [this.keywordCategories.umthes]: this.umthesKeywords,
      [this.keywordCategories.free]: this.freeKeywords,
      [this.keywordCategories.themes]: this.inspireTopics,
    },
    new: {
      [this.keywordCategories.gemet]: this.gemetKeywordsNew,
      [this.keywordCategories.umthes]: this.umthesKeywordsNew,
      [this.keywordCategories.free]: this.freeKeywordsNew,
      [this.keywordCategories.themes]: this.inspireTopicsNew,
    },
  };

  keywordDialogData = [];
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

    this.form = this.formStateService.getForm();
    this.keywords = this.form.get("keywords").value;

    this.isInspireIdentified = this.form.get("isInspireIdentified")?.value;
    this.inspireTopics = this.isInspireIdentified
      ? this.form.get("themes")?.value || []
      : []; // INSPIRE-Themen
    this.isoCategories = this.form.get("topicCategories")?.value || []; // ISO-Themenkategorie

    this.hasKeywords =
      Object.values(this.keywords).some((keywords) => keywords.length > 0) ||
      this.inspireTopics.length > 0 ||
      this.isoCategories.length > 0;

    if (!this.hasKeywords) {
      return false;
    }

    this.keywords = this.form.get("keywords")?.value;

    this.gemetKeywords = this.keywords?.gemet || [];
    this.umthesKeywords = this.keywords?.umthes || [];
    this.freeKeywords = this.keywords?.free || [];

    this.timedOutKeywords = [];
    this.timedOutThesauri = [];

    return true;
  }

  protected async consolidateKeywords() {
    this.isLoading = true;
    this.timedOutKeywords = [];
    this.timedOutThesauri = [];

    try {
      let analyzedKeywords = await this.keywordAnalysis.analyzeKeywords(
        [
          ...this.gemetKeywords,
          ...this.umthesKeywords,
          ...this.freeKeywords,
          ...this.getInspireLabels(),
        ].map((keyword) => keyword.label),
        this.isInspireIdentified,
      );
      analyzedKeywords = removeDuplicatesByValue(analyzedKeywords, "label");

      this.categorizeKeywords(analyzedKeywords);
      this.addAllKeywordStatuses();
      this.keepKeywordsFoundWithDifferentLabel();
      this.sortKeywordsByStatus();
      this.removeAllDuplicateKeywords();
      this.setKeywordDialogData();
    } finally {
      this.isLoading = false;
    }
  }

  private categorizeKeywords(analyzedKeywords: any[]) {
    this.gemetKeywordsNew = analyzedKeywords.filter(
      (keyword) => keyword.thesaurus === this.keywordCategories.gemet,
    );
    this.umthesKeywordsNew = analyzedKeywords.filter(
      (keyword) => keyword.thesaurus === this.keywordCategories.umthes,
    );
    this.freeKeywordsNew = analyzedKeywords.filter(
      (keyword) => keyword.thesaurus === this.keywordCategories.free,
    );
    this.inspireTopicsNew = analyzedKeywords.filter(
      (keyword) => keyword.thesaurus === this.keywordCategories.themes,
    );
  }

  private addAllKeywordStatuses() {
    const addStatuses = (newKeywords: any[], oldKeywords: any[]) => {
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
    addStatuses(this.inspireTopicsNew, this.getInspireLabels());
  }

  // Special handling getting label from codelist id's
  private getInspireLabels() {
    return this.inspireTopics.map((keyword) => ({
      label: this.codelistQuery.getCodelistEntryByKey("6100", keyword.key)
        .fields["de"],
    }));
  }

  // Keep keywords that were found with a different label in another thesaurus e.g. Kita -> Kindertagesstätte
  private keepKeywordsFoundWithDifferentLabel() {
    this.freeKeywords.map((keyword) => {
      if (
        ![
          ...this.umthesKeywordsNew,
          ...this.gemetKeywordsNew,
          ...this.inspireTopicsNew,
        ].some((k) => k.label.toLowerCase() === keyword.label.toLowerCase())
      ) {
        this.freeKeywordsNew.push({ ...keyword, status: "unchanged" });
      }
    });
    this.umthesKeywords.map((keyword) => {
      if (
        !this.gemetKeywordsNew.some(
          (k) =>
            k.label.toLowerCase() === keyword.label.toLowerCase() &&
            !this.umthesKeywordsNew.some(
              (k) => k.label.toLowerCase() === keyword.label.toLowerCase(),
            ),
        )
      ) {
        this.umthesKeywordsNew.push({
          found: true,
          label: keyword.label,
          thesaurus: keyword.thesaurus,
          value: keyword,
          status: "unchanged",
        });
      }
    });
  }

  mapAndAcceptConsolidatedKeywords() {
    this.mapAllKeywords();
    this.form.get("keywords").setValue(this.doc.keywords);
    this.form.get("themes").setValue(this.doc.themes);
    this.dialogRef.close("confirm");
  }

  // Map ThesaurusResult keywords to format expected by the backend
  private mapAllKeywords() {
    console.log(this.gemetKeywordsNew);
    console.log(this.umthesKeywordsNew);
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
      const order = { unchanged: 0, "": 0, added: 1, removed: 2, undefined: 3 };
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
    // Change status of duplicate keywords to "removed" case-insensitively
    this.markDuplicatesAsRemoved(this.freeKeywordsNew);
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
  // Iterates over the array and marks duplicates as removed except the first one
  private markDuplicatesAsRemoved(arr: any[]) {
    const seenLabels = new Set<string>();

    arr.forEach((item) => {
      const labelLowerCase = item.label.toLowerCase();

      if (seenLabels.has(labelLowerCase)) {
        item.status = "removed";
      } else {
        seenLabels.add(labelLowerCase);
      }
    });

    return arr;
  }
}
