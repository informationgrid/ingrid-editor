import { ThesaurusResult } from "../components/thesaurus-result";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { ConfigService } from "../../../app/services/config/config.service";
import { inject, Injectable } from "@angular/core";
import { CodelistQuery } from "../../../app/store/codelist/codelist.query";
import { IgeError } from "../../../app/models/ige-error";

export interface KeywordSectionOptions {
  priorityDataset?: boolean;
  spatialScope?: boolean;
  thesaurusTopics?: boolean;
  inspireTopics?: boolean;
  advProductGroup?: boolean;
}

@Injectable({ providedIn: "root" })
export class KeywordAnalysis {
  http = inject(HttpClient);
  codelistQuery = inject(CodelistQuery);

  async analyzeKeywords(values: string[], checkThemes: boolean) {
    return await Promise.all(
      values
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0)
        .map(async (item) => await this.assignKeyword(item, checkThemes)),
    );
  }

  keywordExists(item: ThesaurusResult, model: any): boolean {
    const thesaurusModel = this.mapThesaurusToModel(item, model);
    return thesaurusModel?.some((keyword: any) => {
      if (item.thesaurus === "INSPIRE-Themen") {
        return keyword.key === item.value.key;
      } else {
        return keyword.label === item.value.label;
      }
    });
  }

  addKeyword(item: ThesaurusResult, model: any) {
    const thesaurusModel = this.mapThesaurusToModel(item, model);
    thesaurusModel.push(item.value);
  }

  private mapThesaurusToModel(item: ThesaurusResult, model: any): any {
    switch (item.thesaurus) {
      case "Gemet Schlagworte":
        return model.keywords.gemet;
      case "Umthes Schlagworte":
        return model.keywords.umthes;
      case "Freie Schlagworte":
        return model.keywords.free;
      case "INSPIRE-Themen":
        return model.themes;
      default:
        throw new IgeError(`Thesaurus not supported: ${item.thesaurus}`);
    }
  }

  private async assignKeyword(item: string, checkThemes: boolean) {
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

  private checkInThemes(item: string): ThesaurusResult {
    const id = this.codelistQuery.getCodelistEntryIdByValue("6100", item, "de");
    if (id) {
      return {
        thesaurus: "INSPIRE-Themen",
        found: true,
        value: { key: id },
      };
    }
    return { thesaurus: "INSPIRE-Themen", found: false, value: item };
  }

  private addFreeKeyword(item: string): ThesaurusResult {
    return {
      found: true,
      value: { label: item },
      thesaurus: "Freie Schlagworte",
    };
  }

  private async checkInThesaurus(
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
      };
    }
    return { thesaurus: thesaurusName, found: false, value: item };
  }
}
