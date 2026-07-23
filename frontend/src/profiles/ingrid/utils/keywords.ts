/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
import { ThesaurusResult } from "../components/thesaurus-result";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { ConfigService } from "../../../app/services/config/config.service";
import { inject, Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { FormArray, FormGroup } from "@angular/forms";
import { CodelistStore } from "../../../app/store/codelist/codelist.store";

export interface KeywordSectionOptions {
  priorityDataset?: boolean;
  spatialScope?: boolean;
  thesaurusTopics?: boolean;
  inspireTopics?: boolean;
  mobilithekTopics?: boolean;
}

export interface Thesaurus {
  id: string;
  label: string;
  type: "external" | "codelist";
  modelPath: string;
  codelistId?: string;
}

@Injectable({ providedIn: "root" })
export class KeywordAnalysis {
  http = inject(HttpClient);
  private codelistStore = inject(CodelistStore);
  snack = inject(MatSnackBar);

  static inspireToIsoMapping = {
    "101": "13",
    "103": "13",
    "104": "3",
    "105": "13",
    "106": "15",
    "107": "18",
    "108": "12",
    "109": "7",
    "201": "6",
    "202": "10",
    "203": "10",
    "204": "8",
    "301": "3",
    "302": "17",
    "303": "8",
    "304": "15",
    "305": "9",
    "306": "19",
    "307": "17",
    "308": "17",
    "309": "1",
    "310": "16",
    "311": "15",
    "312": "8",
    "313": "4",
    "315": "14",
    "316": "14",
    "317": "2",
    "318": "2",
    "319": "2",
    "320": "5",
    "321": "5",
  };

  async analyzeKeywords(
    values: string[],
    thesauri: Thesaurus[],
  ): Promise<ThesaurusResult[]> {
    return await Promise.all(
      values
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0)
        .map(async (item) => await this.assignKeyword(item, thesauri)),
    );
  }

  updateForm(
    data: ThesaurusResult[],
    form: FormGroup | FormArray,
    thesaurusTopics: boolean,
  ) {
    let dirtyForm = false;

    data.forEach((item: ThesaurusResult) => {
      const keywordExists = this.keywordExists(item, form);
      const isInspireTopic = item.thesaurus.id === "inspireTopics"; // TODO generalize
      const shouldUpdateIsoCategory = isInspireTopic && thesaurusTopics;

      if (item.status === "removed") {
        if (!keywordExists) return;

        this.removeKeyword(item, form);

        if (shouldUpdateIsoCategory) {
          this.updateIsoCategory(item.value, form, true);
        }

        dirtyForm = true;
        return;
      }

      if (keywordExists) return;

      this.addKeyword(item, form);

      if (shouldUpdateIsoCategory) {
        this.updateIsoCategory(item.value, form);
      }

      dirtyForm = true;
    });

    if (dirtyForm) {
      form.markAsDirty();
    }
  }

  updateIsoCategory(
    item: any,
    form: FormGroup | FormArray,
    doRemove: boolean = false,
  ) {
    const isoKey = KeywordAnalysis.inspireToIsoMapping[item.key];
    if (!isoKey) return;

    // check if exists and add if not
    const topicsCtrl = form.get("topicCategories");
    const alreadyExists = topicsCtrl.value.some(
      (topic: any) => topic.key === isoKey,
    );
    const isoValue = this.codelistStore.getCodelistEntryValueByKey(
      "527",
      isoKey,
    );

    if (!doRemove && !alreadyExists) {
      topicsCtrl.setValue([...topicsCtrl.value, { key: isoKey }]);
      this.snack.open(
        `Die abhängige ISO-Kategorie '${isoValue}' wurde ebenfalls hinzugefügt.`,
      );
    } else if (doRemove && alreadyExists) {
      topicsCtrl.setValue(
        topicsCtrl.value.filter((topic: any) => topic.key !== isoKey),
      );
      this.snack.open(
        `Die abhängige ISO-Kategorie '${isoValue}' wurde ebenfalls entfernt.`,
      );
    }
  }

  keywordExists(item: ThesaurusResult, form: FormGroup | FormArray): boolean {
    const thesaurusCtrl = form.get(item.thesaurus.modelPath);
    return thesaurusCtrl.value?.some((keyword: any) => {
      if (item.thesaurus.type == "codelist") {
        return keyword.key === item.value.key;
      } else {
        return keyword.label === item.value.label;
      }
    });
  }

  addKeyword(item: ThesaurusResult, form: FormGroup | FormArray) {
    const thesaurusCtrl = form.get(item.thesaurus.modelPath);
    thesaurusCtrl.setValue([...thesaurusCtrl.value, item.value]);
  }

  removeKeyword(item: ThesaurusResult, form: FormGroup | FormArray) {
    const thesaurusCtrl = form.get(item.thesaurus.modelPath);
    thesaurusCtrl.setValue(
      thesaurusCtrl.value.filter((keyword: any) => {
        if (item.thesaurus.type == "codelist") {
          return keyword.key !== item.value.key;
        } else {
          return keyword.label !== item.value.label;
        }
      }),
    );
  }

  private async assignKeyword(item: string, thesauri: Thesaurus[]) {
    for (const thesaurus of thesauri) {
      let result: ThesaurusResult;
      if (thesaurus.type === "codelist") {
        result = this.checkInCodelistThesaurus(item, thesaurus);
      } else {
        result = await this.checkInExternalThesaurus(item, thesaurus);
      }
      if (result.found) return result;
    }

    return this.addFreeKeyword(item);
  }

  checkInCodelistThesaurus(
    item: string,
    thesaurus: Thesaurus,
  ): ThesaurusResult {
    const codeListEntry = this.codelistStore.getCodelistEntryByValue(
      thesaurus.codelistId,
      item,
      "de",
      false,
    );
    const id = codeListEntry?.id;
    const label = codeListEntry?.fields["de"];
    return {
      thesaurus: thesaurus,
      found: id !== undefined,
      value:
        id !== undefined
          ? { key: id, value: label, _codelistId: thesaurus.codelistId }
          : null,
      label: label,
    };
  }

  private addFreeKeyword(item: string): ThesaurusResult {
    return {
      found: true,
      value: { label: item },
      label: item,
      thesaurus: null, // TODO: generalize either with empty FreeKeyword thesauraus or handle diferently
    };
  }

  private async checkInExternalThesaurus(
    item: string,
    thesaurus: Thesaurus,
  ): Promise<ThesaurusResult> {
    const response = await firstValueFrom(
      this.http.get<any[]>(
        `${ConfigService.backendApiUrl}keywords/${thesaurus.id}?q=${encodeURI(
          item,
        )}&type=EXACT`,
      ),
    );
    if (response.length > 0) {
      return {
        thesaurus: thesaurus,
        found: true,
        value: response[0],
        label: response[0].label,
      };
    }
    return { thesaurus: thesaurus, found: false, value: null, label: item };
  }
}
