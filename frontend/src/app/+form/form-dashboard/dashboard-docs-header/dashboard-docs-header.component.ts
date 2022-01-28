import { Component, Input, OnInit } from "@angular/core";
import { FormToolbarService } from "../../form-shared/toolbar/form-toolbar.service";

@Component({
  selector: "dashboard-docs-header",
  templateUrl: "./dashboard-docs-header.component.html",
  styleUrls: ["./dashboard-docs-header.component.scss"],
})
export class DashboardDocsHeaderComponent implements OnInit {
  @Input() canCreateDatasets: boolean;
  @Input() canImport: boolean;

  constructor(private formToolbarService: FormToolbarService) {}

  ngOnInit(): void {}

  createNewFolder() {
    this.formToolbarService.toolbarEvent$.next("CREATE_FOLDER");
  }

  createNewDataset() {
    this.formToolbarService.toolbarEvent$.next("NEW_DOC");
  }

  importDataset() {}
}
