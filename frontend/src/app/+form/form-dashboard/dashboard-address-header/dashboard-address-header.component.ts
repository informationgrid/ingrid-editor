import { Component, Input, OnInit } from "@angular/core";
import { DocEventsService } from "../../../services/event/doc-events.service";

@Component({
  selector: "dashboard-address-header",
  templateUrl: "./dashboard-address-header.component.html",
  styleUrls: ["./dashboard-address-header.component.scss"],
})
export class DashboardAddressHeaderComponent implements OnInit {
  @Input() canCreateAddress: boolean;
  @Input() canImport: boolean;

  constructor(private docEvents: DocEventsService) {}

  ngOnInit(): void {}

  createNewFolder() {
    this.docEvents.onEvent("CREATE_FOLDER");
  }

  createNewAddress() {
    this.docEvents.onEvent("NEW_DOC");
  }

  importDataset() {}
}
