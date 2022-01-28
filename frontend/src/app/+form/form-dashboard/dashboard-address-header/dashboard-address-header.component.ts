import { Component, Input, OnInit } from "@angular/core";
import { FormToolbarService } from "../../form-shared/toolbar/form-toolbar.service";

@Component({
  selector: "dashboard-address-header",
  templateUrl: "./dashboard-address-header.component.html",
  styleUrls: ["./dashboard-address-header.component.scss"],
})
export class DashboardAddressHeaderComponent implements OnInit {
  @Input() canCreateAddress: boolean;
  @Input() canImport: boolean;

  constructor(private formToolbarService: FormToolbarService) {}

  ngOnInit(): void {}

  createNewFolder() {
    this.formToolbarService.toolbarEvent$.next("CREATE_FOLDER");
  }

  createNewAddress() {
    this.formToolbarService.toolbarEvent$.next("NEW_DOC");
  }

  importDataset() {}
}
