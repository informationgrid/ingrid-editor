import { Component, OnInit, signal } from "@angular/core";
import { ConfigService } from "../services/config/config.service";
import { DocumentService } from "../services/document/document.service";
import { DocumentAbstract } from "../store/document/document.model";
import { BehaviorSubject, Observable } from "rxjs";
import { SessionQuery } from "../store/session.query";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import {
  CreateNodeComponent,
  CreateOptions,
} from "../+form/dialogs/create/create-node.component";
import { map } from "rxjs/operators";
import { MessageService } from "../services/messages/message.service";
import { Message } from "../services/messages/message";

@Component({
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  canCreateAddress: boolean;
  canCreateDataset: boolean;
  canImport: boolean;

  recentDocs$: Observable<DocumentAbstract[]>;
  recentPublishedDocs$: Observable<DocumentAbstract[]>;
  oldestExpiredDocs$: Observable<DocumentAbstract[]>;
  chartDataPublished = signal<number[]>(null);
  messages$: BehaviorSubject<Message[]>;

  constructor(
    configService: ConfigService,
    private router: Router,
    private dialog: MatDialog,
    private docService: DocumentService,
    private sessionQuery: SessionQuery,
    private messageService: MessageService
  ) {
    this.messages$ = this.messageService.messages$;
    this.canCreateAddress = configService.hasPermission("can_create_address");
    this.canCreateDataset = configService.hasPermission("can_create_dataset");
    this.canImport = configService.hasPermission("can_import");
  }

  ngOnInit() {
    this.recentDocs$ = this.sessionQuery.latestDocuments$.pipe(
      map((docs) => docs.slice(0, 5))
    );
    this.recentPublishedDocs$ =
      this.sessionQuery.latestPublishedDocuments$.pipe(
        map((docs) => docs.slice(0, 5))
      );
    this.oldestExpiredDocs$ = this.sessionQuery.oldestExpiredDocuments$.pipe(
      map((docs) => docs.slice(0, 5))
    );
    this.fetchStatistic();
    this.fetchData();
    this.messageService.loadStoredMessages();
  }

  fetchStatistic() {
    this.docService.getStatistic().subscribe((response) => {
      this.chartDataPublished.set([response.numDrafts, response.numPublished]);
    });
  }

  fetchData() {
    this.docService.findRecent();
    this.docService.findExpired();
  }

  createNewDocument() {
    this.dialog.open(CreateNodeComponent, {
      minWidth: 500,
      maxWidth: 600,
      minHeight: 400,
      disableClose: true,
      hasBackdrop: true,
      data: {
        parent: null,
        forAddress: false,
        isFolder: false,
      } as CreateOptions,
    });
  }

  createNewAddress() {
    this.dialog.open(CreateNodeComponent, {
      minWidth: 500,
      maxWidth: 600,
      minHeight: 400,
      disableClose: true,
      hasBackdrop: true,
      data: {
        parent: null,
        forAddress: true,
        isFolder: false,
      } as CreateOptions,
    });
  }

  gotoImportPage() {
    this.router.navigate([`${ConfigService.catalogId}/importExport/import`]);
  }

  openDocument(uuid: string) {
    this.router.navigate([`${ConfigService.catalogId}/form`, { id: uuid }]);
  }

  openAddress(uuid: string) {
    this.router.navigate([`${ConfigService.catalogId}/address`, { id: uuid }]);
  }

  createNewFolder() {
    this.dialog.open(CreateNodeComponent, {
      minWidth: 500,
      maxWidth: 600,
      minHeight: 400,
      disableClose: true,
      hasBackdrop: true,
      data: {
        forAddress: false,
        isFolder: true,
      } as CreateOptions,
    });
  }
}
