/**
 * ==================================================
 * Copyright (C) 2024 wemove digital solutions GmbH
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
import { Component, inject, Inject, OnInit } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

import { MatChip, MatChipListbox } from "@angular/material/chips";
import { NgClass } from "@angular/common";
import { DialogTemplateComponent } from "../../../../../app/shared/dialog-template/dialog-template.component";
import { FormStateService } from "../../../../../app/+form/form-state.service";
import { ConfigService } from "../../../../../app/services/config/config.service";
import { KeywordAnalysis } from "../../../utils/keywords";
import {
  ThesaurusResult,
  ThesaurusType,
} from "../../../components/thesaurus-result";
import { removeDuplicatesByValue } from "../../../../../app/shared/utils";
import { IgeDocument, Metadata } from "../../../../../app/models/ige-document";
import { UntypedFormGroup } from "@angular/forms";
import { BackendOption } from "../../../../../app/store/codelist/codelist.model";
import { CodelistStore } from "../../../../../app/store/codelist/codelist.store";

export interface ConsolidateDialogData {
  id: number;
}

export class Keyword {
  id?: string;
  label: string;
  alternativeLabel?: string;
}
export class Keywords {
  gemet?: Object[];
  umthes?: Object[];
  free?: Object[];
}

interface ThesaurusTypeInfo extends Array<any | ThesaurusResult[]> {
  0: any;
  1: ThesaurusResult[];
}

@Component({
  selector: "consolidate-keywords-dialog",
  templateUrl: "./consolidate-dialog.component.html",
  styleUrls: ["./consolidate-dialog.component.scss"],
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChip,
    MatChipListbox,
    NgClass,
    DialogTemplateComponent,
  ],
  standalone: true,
})
export class ConsolidateDialogComponent implements OnInit {
  private codelistStore = inject(CodelistStore);
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConsolidateDialogData,
    private dialogRef: MatDialogRef<ConsolidateDialogComponent>,
    private formStateService: FormStateService,
    public configService: ConfigService,
    private keywordAnalysis: KeywordAnalysis,
  ) {}

  doc: IgeDocument;
  form: UntypedFormGroup;
  metadata: Metadata;
  keywords: Keywords;
  isInspireIdentified: boolean;

  keywordCategories: { [x: string]: ThesaurusType } = {
    gemet: "Gemet-Schlagworte",
    umthes: "Umthes-Schlagworte",
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

  timedOut: boolean;

  keywordHierarchyMap: Map<ThesaurusType, ThesaurusTypeInfo>;

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

    this.isInspireIdentified = this.form.value.properties?.isInspireIdentified;
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

    this.gemetKeywords = this.keywords?.gemet || [];
    this.umthesKeywords = this.keywords?.umthes || [];
    this.freeKeywords = this.keywords?.free || [];

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
    this.timedOut = false;

    try {
      let analyzedKeywords = await this.keywordAnalysis.analyzeKeywords(
        [
          ...this.gemetKeywords,
          ...this.umthesKeywords,
          ...this.freeKeywords,
          ...this.inspireTopics.map((keyword) => this.getInspireLabel(keyword)),
        ].map((keyword) => keyword.label),
        this.isInspireIdentified,
      );
      analyzedKeywords = removeDuplicatesByValue(analyzedKeywords, "label");
      console.log("Analyzed Keywords", analyzedKeywords);
      this.categorizeKeywords(analyzedKeywords);
      this.addAllKeywordStatuses();
      this.keepKeywordsFoundWithAlternativeLabel();
      this.sortKeywordsByStatus();
      this.removeAllDuplicateKeywords();
      this.setKeywordDialogData();
    } catch (error) {
      console.error("Error consolidating keywords", error);
      this.timedOut = true;
    } finally {
      this.isLoading = false;
    }
  }

  private categorizeKeywords(analyzedKeywords: ThesaurusResult[]) {
    for (let [thesaurus, [oldKeywords, _]] of this.keywordHierarchyMap) {
      this.keywordHierarchyMap.set(thesaurus, [
        oldKeywords,
        analyzedKeywords?.filter((keyword) => keyword.thesaurus === thesaurus),
      ]);
    }
  }

  private addKeywordStatuses(
    oldKeywords: any,
    newKeywords: ThesaurusResult[],
    thesaurus: ThesaurusResult["thesaurus"],
  ) {
    const results: any[] = [];
    const isInspire = thesaurus === this.keywordCategories.themes;
    if (isInspire) {
      newKeywords.forEach((keyword) => {
        if (!oldKeywords.some((item) => item.key === keyword.value.key)) {
          results.push({ ...keyword, status: "added" });
        } else {
          results.push({ ...keyword, status: "unchanged" });
        }
      });
      oldKeywords.forEach((keyword) => {
        if (!newKeywords.some((k) => k.value.key === keyword.key)) {
          results.push({
            found: false,
            label: this.getInspireLabel(keyword).label,
            value: { key: keyword.key },
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

  private getInspireLabel(option: BackendOption) {
    return {
      label:
        this.codelistStore.getCodelistEntryByKey("6100", option.key)?.fields?.[
          "de"
        ] ?? option.value,
    };
  }

  private keepKeywordsFoundWithAlternativeLabel() {
    let otherThesauriNewKeywords: ThesaurusResult[] = [];
    for (let [thesaurus, [oldKeywords, newKeywords]] of this
      .keywordHierarchyMap) {
      if (thesaurus === this.keywordCategories.themes) {
        continue;
      }
      otherThesauriNewKeywords = Array.from(this.keywordHierarchyMap)
        .filter(([key]) => key !== thesaurus)
        .flatMap(([_, [, keywords]]) => keywords);
      const keywords = newKeywords;
      oldKeywords.map((keyword: ThesaurusResult) => {
        const wasFoundInOtherThesauri = otherThesauriNewKeywords.some(
          (k) => k.label?.toLowerCase() === keyword.label?.toLowerCase(),
        );
        const wasRemoved = newKeywords.some(
          (k2) =>
            k2.label.toLowerCase() === keyword.label.toLowerCase() &&
            k2.status === "removed",
        );
        if (!wasFoundInOtherThesauri && wasRemoved) {
          keywords.find((k) => k.label === keyword.label).status = "unchanged";
        }
      });
      this.keywordHierarchyMap.set(thesaurus, [oldKeywords, keywords]);
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
