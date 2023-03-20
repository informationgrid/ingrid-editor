import { Component } from "@angular/core";
import {
  GetCapabilitiesAnalysis,
  GetCapabilitiesService,
} from "./get-capabilities.service";
import { catchError, filter, tap } from "rxjs/operators";
import { Observable, of } from "rxjs";

interface ReportItem {
  key: string;
  title: string;
  value: string | string[];
  hasMultiValues?: boolean;
}

@Component({
  selector: "ige-get-capabilities-dialog",
  templateUrl: "./get-capabilities-dialog.component.html",
  styleUrls: ["./get-capabilities-dialog.component.scss"],
})
export class GetCapabilitiesDialogComponent {
  report: GetCapabilitiesAnalysis;
  error: string;
  isAnalyzing = false;
  report2: ReportItem[];

  constructor(private getCapService: GetCapabilitiesService) {}

  analyze(url: string) {
    this.error = null;
    this.isAnalyzing = true;
    this.getCapService
      .analyze(url)
      .pipe(
        catchError((error) => this.handleError(error)),
        tap(() => (this.isAnalyzing = false)),
        filter((report) => report !== null)
      )
      .subscribe((report) => {
        this.report = report;
        // this.report2 = this.prepareReport(report);
      });
  }

  private simpleArray = ["versions", "keywords"];

  private prepareReport(data: GetCapabilitiesAnalysis): ReportItem[] {
    return Object.keys(data).map((key) => {
      return {
        key: key,
        title: this.mapTitle(key),
        value: "???",
        ...this.mapValue(data, key),
      };
    });
  }

  private handleError(error: any): Observable<null> {
    this.error = error.message;
    return of(null);
  }

  private mapValue(
    data: GetCapabilitiesAnalysis,
    key: string
  ): Partial<ReportItem> {
    if (data[key] instanceof Array && this.simpleArray.indexOf(key) === -1) {
      const values = data[key].map((item) => {
        return item.title;
      });
      return { value: values, hasMultiValues: true };
    } else if (data[key] instanceof Object) {
      return { value: data[key].lastName };
    } else {
      return { value: data[key] };
    }
  }

  private mapTitle(key: string): string {
    switch (key) {
      case "title":
        return "Titel";
      case "descriptions":
        return "Beschreibung";
      default:
        return "???";
    }
  }
}
