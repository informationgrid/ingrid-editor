import { AfterViewInit, Component, ViewChild } from "@angular/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { UvpReport, UvpResearchService } from "./uvp-research.service";
import { FormControl } from "@angular/forms";
import { debounceTime } from "rxjs/operators";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { saveAs } from "file-saver";

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
  facetForm = new FormControl();
  dataSource = new MatTableDataSource([]);
  displayedColumns = ["eiaNumber", "eiaCategory", "count"];

  constructor(private uvpResearchService: UvpResearchService) {
    this.initData();
    this.facetForm.valueChanges
      .pipe(untilDestroyed(this), debounceTime(300))
      .subscribe(() => this.getReport(this.facetForm.value));
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case "eiaNumber": {
          return new Date(item.date);
        }
        default: {
          return item[property];
        }
      }
    };
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
      report.averageProcedureDuration
    );
    this.dataSource.data = this.uvpResearchService.createNumberStatistic(
      report.eiaStatistic
    );
  }

  downloadReport() {
    let fileText =
      "UVP Nummer; UVP-G Kategorie; Anzahl; Positive Vorprüfungen; Negative Vorprüfungen; Durchschnittliche Verfahrensdauer\n";
    fileText += `;;;${this.report.positivePreliminaryAssessments};${this.report.negativePreliminaryAssessments};${this.averageDuration}\n`;
    this.dataSource.data.forEach((row) => {
      fileText += `${row.eiaNumber};${row.eiaCategory};${row.count}\n`;
    });
    var blob = new Blob([fileText], {
      type: "text/plain;charset=utf-8",
    });
    const filename =
      this.startDate || this.endDate
        ? `report-${this.startDate?.slice(0, 10) ?? ""}__${
            this.endDate?.slice(0, 10) ?? ""
          }.csv`
        : "report.csv";
    saveAs(blob, filename);
  }
}
