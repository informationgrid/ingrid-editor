import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ResearchResponse } from "../../../../app/+research/research.service";
import { HttpClient, HttpParams } from "@angular/common/http";
import {
  ConfigService,
  Configuration,
} from "../../../../app/services/config/config.service";
import { CodelistService } from "../../../../app/services/codelist/codelist.service";
import { CodelistQuery } from "../../../../app/store/codelist/codelist.query";
import { Codelist } from "../../../../app/store/codelist/codelist.model";

export class UvpReport {
  eiaStatistic: any;
  negativePreliminaryAssessments: number;
  positivePreliminaryAssessments: number;
  averageProcedureDuration: number;
}

@Injectable({
  providedIn: "root",
})
export class UvpResearchService {
  private configuration: Configuration;
  private eiaNumbersCodelist: Codelist;

  constructor(
    private http: HttpClient,
    configService: ConfigService,
    private codelistService: CodelistService,
    private codelistQuery: CodelistQuery
  ) {
    this.configuration = configService.getConfiguration();
    this.codelistService.byId("9000");
    this.codelistQuery.selectEntity("9000").subscribe((codelist) => {
      this.eiaNumbersCodelist = codelist;
    });
  }

  getUvpReport(fromDate: string, toDate: string): Observable<UvpReport> {
    let httpParams = new HttpParams();
    if (fromDate) httpParams = httpParams.set("from", fromDate);
    if (toDate) httpParams = httpParams.set("to", toDate);

    return this.http.get<UvpReport>(
      `${this.configuration.backendUrl}uvp/report`,
      { params: httpParams }
    );
  }

  /**
   * Convert number of seconds into format "x years y months z days"
   * @param durationInSeconds
   * @return {string}
   */
  convertAverageDuration(durationInSeconds: number): string {
    const secondsInADay = 86400;
    let durationInDays = Math.floor(durationInSeconds / secondsInADay);
    // The string we're working with to create the representation
    let str = "";
    // Map lengths of `diff` to different time periods
    const values = [
      [" Jahr", 365],
      [" Monat", 30],
      [" Tag", 1],
    ];

    // Iterate over the values...
    for (let i = 0; i < values.length; i++) {
      // @ts-ignore
      const amount = Math.floor(durationInDays / values[i][1]);

      // ... and find the largest time value that fits into the diff
      if (amount >= 1) {
        // If we match, add to the string ('s' is for pluralization)
        // @ts-ignore
        str += amount + values[i][0] + (amount > 1 ? "e" : "") + " ";

        // and subtract from the diff
        // @ts-ignore
        durationInDays -= amount * values[i][1];
      }
    }

    return str;
  }

  createNumberStatistic(eiaStatistic: any): any {
    const result = [];
    for (let i = 0; i < eiaStatistic.length; i++) {
      const eiaId = eiaStatistic[i][0]; //string
      const count = eiaStatistic[i][1]; //int
      const codelistItem = this.eiaNumbersCodelist.entries.find(
        (e) => e.id === eiaId
      );
      const dataField = JSON.parse(codelistItem.data);
      result.push({
        eiaNumber: codelistItem.fields["de"],
        eiaCategory: dataField.cat,
        count: count,
      });
    }
    return result;
  }
}
