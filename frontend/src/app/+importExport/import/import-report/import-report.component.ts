import { Component, Input } from "@angular/core";

interface ImportReport {
  importer: string;
  numDatasets: string;
  numAddresses: string;
  existingDatasets: string;
  existingAddresses: string;
}

@Component({
  selector: "ige-import-report",
  templateUrl: "./import-report.component.html",
  styleUrls: ["./import-report.component.scss"],
})
export class ImportReportComponent {
  @Input() report: ImportReport;
}
