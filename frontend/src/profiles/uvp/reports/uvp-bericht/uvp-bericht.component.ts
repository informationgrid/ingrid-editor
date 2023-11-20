import { AfterViewInit, Component, ViewChild } from "@angular/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { UvpReport, UvpResearchService } from "./uvp-research.service";
import { UntypedFormControl } from "@angular/forms";
import { debounceTime, filter } from "rxjs/operators";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { saveAs } from "file-saver-es";

@UntilDestroy()
@Component({
  selector: "uvp-bericht",
  templateUrl: "./uvp-bericht.component.html",
  styleUrls: ["./uvp-bericht.component.scss"],
})
export class UvpBerichtComponent implements AfterViewInit {
  @ViewChild(MatSort) sort: MatSort;
  report: UvpReport;
  averageDuration: string;

  startDate: string;
  endDate: string;

  facets = {
    addresses: [],
    documents: [
      {
        id: "timeRef",
        label: "Entscheidungsdatum",
        filter: [
          {
            parameters: [],
            implicitFilter: [],
            id: "selectTimespan",
            label: "<group label will be used>",
          },
        ],
        combine: null,
        viewComponent: "TIMESPAN",
      },
    ],
  };
  facetForm = new UntypedFormControl();
  dataSource = new MatTableDataSource([]);
  dataSourceMiscellaneous = new MatTableDataSource([]);
  displayedColumns = ["eiaNumber", "eiaCategory", "count"];
  displayedColumnsMiscellaneous = ["type", "value"];

  constructor(private uvpResearchService: UvpResearchService) {
    this.uvpResearchService.initialized$
      .pipe(
        untilDestroyed(this),
        filter((x) => x),
      )
      .subscribe(() => {
        this.initData();
        this.facetForm.valueChanges
          .pipe(untilDestroyed(this), debounceTime(300))
          .subscribe(() => this.getReport(this.facetForm.value));
      });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case "eiaNumber": {
          return this.getSortableEiaNumber(item.eiaNumber);
        }
        case "eiaCategory": {
          return this.getSortableEiaNumber(item.eiaCategory);
        }
        default: {
          return item[property];
        }
      }
    };
  }

  getSortableEiaNumber(eiaNumber: string) {
    const textpart = eiaNumber.split("-")[0];
    let versionNumber = eiaNumber.split("-")[1];
    versionNumber = versionNumber
      .split(".")
      .map((part) => {
        return part.length === 1 ? "0" + part : part;
      })
      .join(".");

    // Pad to 4 sub-version numbers (e.g. 13 -> 13.00.00.00)
    versionNumber = versionNumber.padEnd(11, ".00");
    return textpart + "-" + versionNumber;
  }

  getReport(formValue) {
    this.startDate = formValue.timeRef.start?.toISOString();
    this.endDate = formValue.timeRef.end?.toISOString();
    this.uvpResearchService
      .getUvpReport(this.startDate, this.endDate)
      .subscribe((report) => {
        this.updateReport(report);
      });
  }

  initData() {
    this.uvpResearchService.getUvpReport(null, null).subscribe((report) => {
      this.updateReport(report);
    });
  }

  updateReport(report: UvpReport) {
    this.report = report;
    this.averageDuration = this.uvpResearchService.convertAverageDuration(
      report.averageProcedureDuration,
    );
    this.dataSource.data = this.uvpResearchService.createNumberStatistic(
      report.eiaStatistic,
    );
    this.dataSourceMiscellaneous.data = [
      {
        type: "Abgeschlossene Vorhaben",
        value: report.procedureCount,
      },
      {
        type: "Positive Vorprüfungen",
        value: report.positivePreliminaryAssessments,
      },
      {
        type: "Negative Vorprüfungen",
        value: report.negativePreliminaryAssessments,
      },
      {
        type: "Durchschnittliche Verfahrensdauer",
        value: this.averageDuration,
      },
    ];
  }

  downloadReport() {
    let fileText =
      "UVP Nummer; UVP-G Kategorie; Anzahl; Abgeschlossene Vorhaben; Positive Vorprüfungen; Negative Vorprüfungen; Durchschnittliche Verfahrensdauer\n";
    fileText += `;;;${this.report.procedureCount};${this.report.positivePreliminaryAssessments};${this.report.negativePreliminaryAssessments};${this.averageDuration}\n`;
    this.dataSource.data.forEach((row) => {
      fileText += `${row.eiaNumber};${row.eiaCategory};${row.count}\n`;
    });
    const blob = new Blob([fileText], {
      type: "text/plain;charset=utf-8",
    });
    const filename =
      this.startDate || this.endDate
        ? `report-${this.convertISOtoSimpleLocaleDate(
            this.startDate,
          )}__${this.convertISOtoSimpleLocaleDate(this.endDate)}.csv`
        : "report.csv";
    saveAs(blob, filename);
  }

  /**
   * Converts an ISO date to a simple locale date string
   * e.g: 2022-03-31T22:00:00.000Z -> 2022-04-01    //(UTC+2)
   * @param date
   * @private
   */
  private convertISOtoSimpleLocaleDate(date: string) {
    if (!date) return "";
    return new Date(Date.parse(date)).toLocaleDateString("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }
}
