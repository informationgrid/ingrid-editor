/*
 * ==================================================
 * Copyright (C) 2024-2026 wemove digital solutions GmbH
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
import { Component, inject, Inject, OnInit, signal } from "@angular/core";
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
import {
  FREE_THESAURUS,
  KeywordAnalysis,
  Thesaurus,
} from "../../../utils/keywords";
import { ProfileService } from "../../../../../app/services/profile.service";
import { ThesaurusResult } from "../../../components/thesaurus-result";
import { removeDuplicatesByValue } from "../../../../../app/shared/utils";
import { IgeDocument, Metadata } from "../../../../../app/models/ige-document";
import { UntypedFormGroup } from "@angular/forms";
import { BackendOption } from "../../../../../app/store/codelist/codelist.model";
import { CodelistStore } from "../../../../../app/store/codelist/codelist.store";
import { GeneralStore } from "../../../../../app/store/general.store";
import { IngridShared } from "../../../doctypes/ingrid-shared";

export interface ConsolidateDialogData {
  id: number;
}

export class Keyword {
  id?: string;
  label: string;
  alternativeLabel?: string;
}
export class Keywords {
  gemet?: Keyword[];
  umthes?: Keyword[];
  free?: Keyword[];
}

export interface ThesaurusTypeInfo extends Array<any[] | ThesaurusResult[]> {
  0: any[];
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
})
export class ConsolidateDialogComponent implements OnInit {
  private profileService = inject(ProfileService);
  private generalStore = inject(GeneralStore);

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
  isInspireIdentified: boolean;

  hasKeywords: boolean;
  canHaveIsoCategories: boolean;
  enabledThesauri: Thesaurus[] = [];

  isoCategories: any[] = [];

  timedOut: boolean;

  keywordHierarchyMap: Map<Thesaurus, ThesaurusTypeInfo>;

  keywordDialogData = [];
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);

  async ngOnInit() {
    this.doc = this.generalStore.getOpenedDocument(false);
    const hasKeywords = this.initKeywords();
    if (!hasKeywords) {
      this.isLoading.set(false);
      return;
    }
    await this.consolidateKeywords();
  }

  private initKeywords() {
    this.isLoading.set(true);

    this.form = this.formStateService.getForm();
    const doctype = this.profileService.getDoctype(
      this.doc._type,
    ) as IngridShared;
    if (doctype && "keywordThesauri" in doctype) {
      this.enabledThesauri = doctype.keywordThesauri.filter(
        (thesaurus) => thesaurus.isEnabled?.(this.form) ?? true,
      );
    }

    this.isInspireIdentified = this.form.value.properties?.isInspireIdentified;
    this.canHaveIsoCategories =
      this.isInspireIdentified && this.form.get("topicCategories") !== null;
    this.isoCategories = this.form.get("topicCategories")?.value || []; // ISO-Themenkategorie

    this.hasKeywords =
      this.enabledThesauri
        .map(
          (thesaurus) =>
            this.form.get(thesaurus.modelPath.split("."))?.value || [],
        )
        .some((keywords) => keywords.length > 0) ||
      this.isoCategories.length > 0;

    if (!this.hasKeywords) {
      return false;
    }

    this.keywordHierarchyMap = new Map();
    this.enabledThesauri.forEach((thesaurus) => {
      const keywords =
        this.form.get(thesaurus.modelPath.split("."))?.value || [];
      this.keywordHierarchyMap.set(thesaurus, [keywords, []]);
    });

    return true;
  }

  protected async consolidateKeywords() {
    this.isLoading.set(true);
    this.timedOut = false;

    try {
      const allKeywordsToAnalyze = Array.from(
        this.keywordHierarchyMap.entries(),
      ).flatMap(([thesaurus, [keywords]]) => {
        return keywords.map((keyword) =>
          thesaurus.type === "codelist" ? keyword.value : keyword.label,
        );
      });

      let analyzedKeywords = await this.keywordAnalysis.analyzeKeywords(
        allKeywordsToAnalyze,
        this.enabledThesauri,
        this.form,
      );

      analyzedKeywords = removeDuplicatesByValue(analyzedKeywords, "label");
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
      this.isLoading.set(false);
    }
  }

  private categorizeKeywords(analyzedKeywords: ThesaurusResult[]) {
    for (let [thesaurus, [oldKeywords, _]] of this.keywordHierarchyMap) {
      this.keywordHierarchyMap.set(thesaurus, [
        oldKeywords,
        analyzedKeywords?.filter((keyword) => {
          if (thesaurus.type === "free") {
            return keyword.thesaurus.type === "free";
          }
          return keyword.thesaurus?.id === thesaurus.id;
        }),
      ]);
    }
  }

  private addKeywordStatuses(
    oldKeywords: any[],
    newKeywords: ThesaurusResult[],
    thesaurus: Thesaurus,
  ) {
    const results: any[] = [];
    if (thesaurus.type === "codelist") {
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
            label: keyword.value,
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
      if (thesaurus.type === "codelist") {
        continue;
      }
      otherThesauriNewKeywords = Array.from(this.keywordHierarchyMap)
        .filter(([key]) => key.id !== thesaurus.id)
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
      if (thesaurus.type !== "external") {
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
        label: thesaurus.label,
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
