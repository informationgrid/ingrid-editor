import { Component, OnInit } from "@angular/core";
import {
  ConfigService,
  Configuration,
} from "../services/config/config.service";
import { DocumentService } from "../services/document/document.service";
import { DocumentAbstract } from "../store/document/document.model";
import { Observable, Subject } from "rxjs";
import { SessionQuery } from "../store/session.query";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import {
  CreateNodeComponent,
  CreateOptions,
} from "../+form/dialogs/create/create-node.component";

@Component({
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  datasets;

  private configuration: Configuration;
  recentDocs$: Observable<DocumentAbstract[]>;
  chartDataPublished = new Subject<number[]>();

  constructor(
    configService: ConfigService,
    private router: Router,
    private dialog: MatDialog,
    private docService: DocumentService,
    private sessionQuery: SessionQuery
  ) {
    this.configuration = configService.getConfiguration();
  }

  ngOnInit() {
    // this.allDocuments$ = this.docQuery.selectAll();
    this.recentDocs$ = this.sessionQuery.latestDocuments$;
    this.fetchStatistic();
    this.fetchData();
  }

  fetchStatistic() {
    this.docService.getStatistic().subscribe((response) => {
      this.chartDataPublished.next([response.numDrafts, response.numPublished]);
    });
  }

  fetchData(query?: string) {
    this.docService.findRecent();
  }

  createNewDocument() {
    const dlg = this.dialog.open(CreateNodeComponent, {
      minWidth: 500,
      maxWidth: 600,
      minHeight: 400,
      disableClose: true,
      data: {
        parent: null,
        forAddress: false,
        isFolder: false,
      } as CreateOptions,
    });
  }

  createNewAddress() {
    const dlg = this.dialog.open(CreateNodeComponent, {
      minWidth: 500,
      maxWidth: 600,
      minHeight: 400,
      disableClose: true,
      data: {
        parent: null,
        forAddress: true,
        isFolder: false,
      } as CreateOptions,
    });
  }

  gotoImportPage() {
    this.router.navigate(["/importExport/import"]);
  }

  openDocument(id: number | string) {
    this.router.navigate(["/form", { id: id }]);
  }

  openAddress(id: number | string) {
    this.router.navigate(["/address", { id: id }]);
  }

  createNewFolder() {
    this.dialog.open(CreateNodeComponent, {
      minWidth: 500,
      maxWidth: 600,
      minHeight: 400,
      disableClose: true,
      data: {
        forAddress: false,
        isFolder: true,
      } as CreateOptions,
    });
  }
}
