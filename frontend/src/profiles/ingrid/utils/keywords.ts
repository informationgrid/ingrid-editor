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
import { ThesaurusResult } from "../components/thesaurus-result";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { ConfigService } from "../../../app/services/config/config.service";
import { inject, Injectable } from "@angular/core";
import { CodelistQuery } from "../../../app/store/codelist/codelist.query";
import { IgeError } from "../../../app/models/ige-error";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { MatSnackBar } from "@angular/material/snack-bar";

export interface KeywordSectionOptions {
  priorityDataset?: boolean;
  spatialScope?: boolean;
  thesaurusTopics?: boolean;
  inspireTopics?: boolean;
}

@Injectable({ providedIn: "root" })
export class KeywordAnalysis {
  http = inject(HttpClient);
  codelistQuery = inject(CodelistQuery);
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

  async analyzeKeywords(values: string[], checkThemes: boolean) {
    return await Promise.all(
      values
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0)
        .map(async (item) => await this.assignKeyword(item, checkThemes)),
    );
  }

  updateForm(
    data: ThesaurusResult[],
    field: FormlyFieldConfig,
    thesaurusTopics: boolean,
  ) {
    data.forEach((item) => {
      if (!this.keywordExists(item, field)) {
        this.addKeyword(item, field);
        if (item.thesaurus === "INSPIRE-Themen" && thesaurusTopics) {
          this.updateIsoCategory(item.value, field);
        }
      }
    });
  }

  updateIsoCategory(
    item: any,
    fieldConfig: FormlyFieldConfig,
    doRemove: boolean = false,
  ) {
    const isoKey = KeywordAnalysis.inspireToIsoMapping[item.key];
    if (!isoKey) return;

    // check if exists and add if not
    const topicsCtrl = fieldConfig.form.get("topicCategories");
    const alreadyExists = topicsCtrl.value.some(
      (topic: any) => topic.key === isoKey,
    );
    const isoValue = this.codelistQuery.getCodelistEntryValueByKey(
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

  keywordExists(
    item: ThesaurusResult,
    fieldConfig: FormlyFieldConfig,
  ): boolean {
    const thesaurusCtrl = fieldConfig.form.get(this.mapThesaurusToModel(item));
    return thesaurusCtrl.value?.some((keyword: any) => {
      if (item.thesaurus === "INSPIRE-Themen") {
        return keyword.key === item.value.key;
      } else {
        return keyword.label === item.value.label;
      }
    });
  }

  addKeyword(item: ThesaurusResult, fieldConfig: FormlyFieldConfig) {
    const thesaurusCtrl = fieldConfig.form.get(this.mapThesaurusToModel(item));
    thesaurusCtrl.setValue([...thesaurusCtrl.value, item.value]);
  }

  private mapThesaurusToModel(item: ThesaurusResult): string {
    switch (item.thesaurus) {
      case "Gemet Schlagworte":
        return "keywords.gemet";
      case "Umthes Schlagworte":
        return "keywords.umthes";
      case "Freie Schlagworte":
        return "keywords.free";
      case "INSPIRE-Themen":
        return "themes";
      default:
        throw new IgeError(`Thesaurus not supported: ${item.thesaurus}`);
    }
  }

  public async assignKeyword(item: string, checkThemes: boolean) {
    if (checkThemes) {
      const resultTheme = this.checkInThemes(item);
      if (resultTheme.found) return resultTheme;
    }

    const gemetResult = await this.checkInThesaurus(item, "gemet");
    if (gemetResult.found) return gemetResult;

    const umthesResult = await this.checkInThesaurus(item, "umthes");
    if (umthesResult.found) return umthesResult;
    else return this.addFreeKeyword(item);
  }

  checkInThemes(item: string): ThesaurusResult {
    const id = this.codelistQuery.getCodelistEntryIdByValue("6100", item, "de");
    return {
      thesaurus: "INSPIRE-Themen",
      found: id !== undefined,
      value: id !== undefined ? { key: id } : null,
      label: item,
    };
  }

  private addFreeKeyword(item: string): ThesaurusResult {
    return {
      found: true,
      value: { label: item },
      label: item,
      thesaurus: "Freie Schlagworte",
    };
  }

  public async checkInThesaurus(
    item: string,
    thesaurus: string,
  ): Promise<ThesaurusResult> {
    const response = await firstValueFrom(
      this.http.get<any[]>(
        `${ConfigService.backendApiUrl}keywords/${thesaurus}?q=${encodeURI(
          item,
        )}&type=EXACT`,
      ),
    );
    const thesaurusName =
      thesaurus === "gemet" ? "Gemet Schlagworte" : "Umthes Schlagworte";
    if (response.length > 0) {
      return {
        thesaurus: thesaurusName,
        found: true,
        value: response[0],
        label: response[0].label,
      };
    }
    return { thesaurus: thesaurusName, found: false, value: null, label: item };
  }
}
