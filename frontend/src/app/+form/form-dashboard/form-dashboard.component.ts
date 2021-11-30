import { Component, OnChanges } from "@angular/core";
import { Observable } from "rxjs";
import { FormToolbarService } from "../form-shared/toolbar/form-toolbar.service";
import { DocumentAbstract } from "../../store/document/document.model";
import { Router } from "@angular/router";
import { DocumentService } from "../../services/document/document.service";
import { SessionQuery } from "../../store/session.query";
import { ConfigService } from "../../services/config/config.service";

@Component({
  selector: "ige-form-dashboard",
  templateUrl: "./form-dashboard.component.html",
  styleUrls: ["./form-dashboard.component.scss"],
})
export class FormDashboardComponent implements OnChanges {
  childDocs$: Observable<DocumentAbstract[]>;
  canCreateDatasets: boolean;
  canImport: boolean;

  constructor(
    configService: ConfigService,
    private formToolbarService: FormToolbarService,
    private router: Router,
    private sessionQuery: SessionQuery,
    private docService: DocumentService
  ) {
    // TODO switch to user specific query
    this.childDocs$ = this.sessionQuery.latestDocuments$;
    this.docService.findRecent();
    this.canCreateDatasets = configService.hasPermission("can_create_dataset");
    this.canImport = configService.hasPermission("can_import");
  }

  ngOnChanges() {
    this.docService.findRecent();
  }

  createNewFolder() {
    this.formToolbarService.toolbarEvent$.next("CREATE_FOLDER");
  }

  createNewDataset() {
    this.formToolbarService.toolbarEvent$.next("NEW_DOC");
  }

  importDataset() {}

  openDocument(id: number | string) {
    this.router.navigate(["/form", { id: id }]);
  }
}
