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
  canHaveIsoCategories: boolean;

  inspireTopics: any[] = [];
  isoCategories: any[] = [];
  gemetKeywords: any[] = [];
  umthesKeywords: any[] = [];
  freeKeywords: any[] = [];

  timedOutKeywords: string[] = [];
  timedOutThesauri: string[] = [];

  keywordHierarchyMap: Map<string, ThesaurusResult[][]>;

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

    this.form = this.formStateService.getForm();
    this.keywords = this.form.get("keywords").value;

    this.isInspireIdentified = this.form.get("isInspireIdentified")?.value;
    this.inspireTopics = this.isInspireIdentified
      ? this.form.get("themes")?.value || []
      : []; // INSPIRE-Themen
    this.canHaveIsoCategories =
      this.isInspireIdentified && this.form.get("topicCategories") !== null;
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

    this.keywordHierarchyMap = new Map([
      [this.keywordCategories.themes, [this.inspireTopics, []]],
      [this.keywordCategories.gemet, [this.gemetKeywords, []]],
      [this.keywordCategories.umthes, [this.umthesKeywords, []]],
      [this.keywordCategories.free, [this.freeKeywords, []]],
    ]);

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
          ...this.inspireTopics.map((keyword) =>
            this.getInspireLabel(keyword.key),
          ),
        ].map((keyword) => keyword.label),
        this.isInspireIdentified,
        true,
      );
      analyzedKeywords = removeDuplicatesByValue(analyzedKeywords, "label");

      analyzedKeywords
        .filter((keyword) => !keyword.found)
        .forEach((keyword) => {
          this.timedOutKeywords.push(keyword.label);
          this.timedOutThesauri.push(keyword.thesaurus);
        });
      this.timedOutThesauri = Array.from(new Set(this.timedOutThesauri));
      analyzedKeywords = analyzedKeywords.filter((keyword) => keyword.found);

      this.categorizeKeywords(analyzedKeywords);
      this.addAllKeywordStatuses();
      this.keepKeywordsFoundWithAlternativeLabel();
      this.sortKeywordsByStatus();
      this.removeAllDuplicateKeywords();
      this.setKeywordDialogData();
    } finally {
      this.isLoading = false;
    }
  }

  private categorizeKeywords(analyzedKeywords: any[]) {
    for (let [thesaurus, [oldKeywords, _]] of this.keywordHierarchyMap) {
      this.keywordHierarchyMap.set(thesaurus, [
        oldKeywords,
        analyzedKeywords.filter((keyword) => keyword.thesaurus === thesaurus),
      ]);
    }
  }

  private addKeywordStatuses(
    oldKeywords: ThesaurusResult[],
    newKeywords: ThesaurusResult[],
    thesaurus: ThesaurusResult["thesaurus"],
  ) {
    const results: any[] = [];
    const isInspire = thesaurus === this.keywordCategories.themes;
    if (isInspire) {
      newKeywords.forEach((keyword) => {
        if (!oldKeywords.some((k) => k["key"] === keyword.value.key)) {
          results.push({ ...keyword, status: "added" });
        } else {
          results.push({ ...keyword, status: "unchanged" });
        }
      });
      oldKeywords.forEach((keyword) => {
        if (!newKeywords.some((k) => k.value.key === keyword["key"])) {
          results.push({
            found: false,
            label: this.getInspireLabel(keyword["key"]).label,
            value: { key: keyword["key"] },
            thesaurus: thesaurus,
            status: "removed",
          });
        }
      });
    } else {
      newKeywords.forEach((keyword) => {
        if (!oldKeywords.some((k) => k.label === keyword.label)) {
          results.push({ ...keyword, status: "added" });
        } else {
          results.push({ ...keyword, status: "unchanged" });
        }
      });
      // oldKeywords not in newKeywords as "removed"
      oldKeywords.forEach((keyword) => {
        if (!newKeywords.some((k) => k.label === keyword.label)) {
          results.push({
            found: false,
            label: keyword.label,
            value: keyword,
            thesaurus: thesaurus,
            status: "removed",
          });
        }
      });
    }

    return results;
  }

  private addAllKeywordStatuses() {
    for (let [thesaurus, [oldKeywords, newKeywords]] of this
      .keywordHierarchyMap) {
      const results = this.addKeywordStatuses(
        oldKeywords,
        newKeywords,
        thesaurus,
      );
      this.keywordHierarchyMap.set(thesaurus, [oldKeywords, results]);
    }
  }

  private getInspireLabel(key: string) {
    return {
      label: this.codelistQuery.getCodelistEntryByKey("6100", key).fields["de"],
    };
  }

  private keepKeywordsFoundWithAlternativeLabel() {
    const otherThesauriNewKeywords: ThesaurusResult[] = [];
    for (let [thesaurus, [oldKeywords, newKeywords]] of this
      .keywordHierarchyMap) {
      if (thesaurus === this.keywordCategories.themes) {
        continue;
      }
      const keywords = newKeywords;
      oldKeywords.map((keyword) => {
        const wasFoundInOtherThesauri = !otherThesauriNewKeywords.some(
          (k) => k.label.toLowerCase() === keyword.label.toLowerCase(),
        );
        const wasNotRemoved = newKeywords.some(
          (k2) =>
            k2.label.toLowerCase() === keyword.label.toLowerCase() &&
            k2.status === "removed",
        );
        if (wasFoundInOtherThesauri && wasNotRemoved) {
          keywords.find((k) => k.label === keyword.label).status = "unchanged";
        }
      });
      this.keywordHierarchyMap.set(thesaurus, [oldKeywords, keywords]);
      otherThesauriNewKeywords.push(...newKeywords);
    }
  }

  acceptConsolidatedKeywords() {
    const keywords = Array.from(this.keywordHierarchyMap.values()).flatMap(
      ([, keywords]) => keywords,
    );
    this.keywordAnalysis.updateForm(
      keywords,
      this.form,
      this.canHaveIsoCategories,
    );
    this.dialogRef.close("confirm");
  }

  private sortByStatus(keywords: ThesaurusResult[]) {
    return keywords.sort((a, b) => {
      const order = { unchanged: 0, "": 0, added: 1, removed: 2, undefined: 3 };
      return order[a.status] - order[b.status];
    });
  }

  private sortKeywordsByStatus() {
    for (let [thesaurus, [oldKeywords, newKeywords]] of this
      .keywordHierarchyMap) {
      this.keywordHierarchyMap.set(thesaurus, [
        oldKeywords,
        this.sortByStatus(newKeywords),
      ]);
    }
  }

  private removeAllDuplicateKeywords() {
    for (let [thesaurus, [oldKeywords, newKeywords]] of this
      .keywordHierarchyMap) {
      if (thesaurus === this.keywordCategories.themes) {
        continue;
      }
      // Remove duplicates case-insensitively
      const editedKeywords = this.markDuplicatesAsRemoved(newKeywords);
      this.keywordHierarchyMap.set(thesaurus, [oldKeywords, editedKeywords]);
    }
  }

  private setKeywordDialogData() {
    this.keywordDialogData = Array.from(this.keywordHierarchyMap.keys()).map(
      (thesaurus) => ({
        label: thesaurus,
        keywords: this.keywordHierarchyMap.get(thesaurus)[1],
      }),
    );
  }

  // Iterates over the array and marks duplicates as removed except the first one
  private markDuplicatesAsRemoved(arr: ThesaurusResult[]) {
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
