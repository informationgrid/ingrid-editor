import { Component, Input, OnInit } from "@angular/core";
import { DocEventsService } from "../../../services/event/doc-events.service";

@Component({
  selector: "dashboard-docs-header",
  templateUrl: "./dashboard-docs-header.component.html",
  styleUrls: ["./dashboard-docs-header.component.scss"],
})
export class DashboardDocsHeaderComponent implements OnInit {
  @Input() canCreateDatasets: boolean;
  @Input() canImport: boolean;

  constructor(private docEvents: DocEventsService) {}

  ngOnInit(): void {}

  createNewFolder() {
    this.docEvents.onEvent("CREATE_FOLDER");
  }

  createNewDataset() {
    this.docEvents.onEvent("NEW_DOC");
  }

  importDataset() {}
}
