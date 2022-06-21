import { Component, Input, OnInit } from "@angular/core";
import { DocEventsService } from "../../../services/event/doc-events.service";
import { Router } from "@angular/router";

@Component({
  selector: "dashboard-docs-header",
  templateUrl: "./dashboard-docs-header.component.html",
  styleUrls: ["./dashboard-docs-header.component.scss"],
})
export class DashboardDocsHeaderComponent implements OnInit {
  @Input() canCreateDatasets: boolean;
  @Input() canImport: boolean;

  constructor(private docEvents: DocEventsService, private router: Router) {}

  ngOnInit(): void {}

  createNewFolder() {
    this.docEvents.sendEvent({ type: "CREATE_FOLDER" });
  }

  createNewDataset() {
    this.docEvents.sendEvent({ type: "NEW_DOC" });
  }

  importDataset() {
    this.router.navigate(["/importExport/import"]);
  }
}
