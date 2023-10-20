import { Component, Input, OnInit } from "@angular/core";
import { DocEventsService } from "../../../services/event/doc-events.service";
import { Router } from "@angular/router";
import { ConfigService } from "../../../services/config/config.service";

@Component({
  selector: "dashboard-address-header",
  templateUrl: "./dashboard-address-header.component.html",
  styleUrls: ["./dashboard-address-header.component.scss"],
})
export class DashboardAddressHeaderComponent implements OnInit {
  @Input() canCreateAddress: boolean;
  @Input() canImport: boolean;

  constructor(
    private docEvents: DocEventsService,
    private router: Router,
  ) {}

  ngOnInit(): void {}

  createNewFolder() {
    this.docEvents.sendEvent({ type: "CREATE_FOLDER" });
  }

  createNewAddress() {
    this.docEvents.sendEvent({ type: "NEW_DOC" });
  }

  importDataset() {
    this.router.navigate([`${ConfigService.catalogId}/importExport/import`]);
  }
}
