import { Component } from "@angular/core";
import {
  GetCapabilitiesAnalysis,
  GetCapabilitiesService,
} from "./get-capabilities.service";

@Component({
  selector: "ige-get-capabilities-dialog",
  templateUrl: "./get-capabilities-dialog.component.html",
  styleUrls: ["./get-capabilities-dialog.component.scss"],
})
export class GetCapabilitiesDialogComponent {
  report: GetCapabilitiesAnalysis;

  constructor(private getCapService: GetCapabilitiesService) {}
  analyze() {
    this.getCapService
      .analyze(
        "https://geoservices.krzn.de/security-proxy/services/wfs_moer_stolpersteine?"
      )
      .subscribe((report) => (this.report = report));
  }
}
