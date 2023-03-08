import { Component, Input } from "@angular/core";
import { ImportLogReport } from "../../exchange.service";

@Component({
  selector: "ige-import-report",
  templateUrl: "./import-report.component.html",
  styleUrls: ["./import-report.component.scss"],
})
export class ImportReportComponent {
  @Input() report: ImportLogReport;
}
