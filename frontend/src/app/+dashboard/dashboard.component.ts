/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
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
import { TranslocoDirective } from "@ngneat/transloco";
import { QuickSearchComponent } from "./quick-search/quick-search.component";
import { ActionButtonComponent } from "../shared/action-button/action-button.component";
import { CardBoxComponent } from "../shared/card-box/card-box.component";
import { ChartComponent } from "./chart/chart.component";
import { DocumentListItemComponent } from "../shared/document-list-item/document-list-item.component";
import { AsyncPipe } from "@angular/common";

@Component({
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
  standalone: true,
  imports: [
    TranslocoDirective,
    QuickSearchComponent,
    ActionButtonComponent,
    CardBoxComponent,
    ChartComponent,
    DocumentListItemComponent,
    AsyncPipe,
  ],
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
    private messageService: MessageService,
  ) {
    this.messages$ = this.messageService.messages$;
    this.canCreateAddress = configService.hasPermission("can_create_address");
    this.canCreateDataset = configService.hasPermission("can_create_dataset");
    this.canImport = configService.hasPermission("can_import");
  }

  ngOnInit() {
    this.recentDocs$ = this.sessionQuery.latestDocuments$.pipe(
      map((docs) => docs.slice(0, 5)),
    );
    this.recentPublishedDocs$ =
      this.sessionQuery.latestPublishedDocuments$.pipe(
        map((docs) => docs.slice(0, 5)),
      );
    this.oldestExpiredDocs$ = this.sessionQuery.oldestExpiredDocuments$.pipe(
      map((docs) => docs.slice(0, 5)),
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
    this.updateRecent();
    this.updatePublished();
    this.updateExpired();
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

  goToExpiryPage(): void {
    this.router.navigate([`${ConfigService.catalogId}/reports/expiration`]);
  }

  openByType(doc: DocumentAbstract) {
    doc.isAddress ? this.openAddress(doc._uuid) : this.openDocument(doc._uuid);
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

  updateRecent(fromCurrentUser: boolean = false) {
    this.docService.findRecentDrafts(fromCurrentUser);
  }

  updatePublished(fromCurrentUser: boolean = false) {
    this.docService.findRecentPublished(fromCurrentUser);
  }

  updateExpired(fromCurrentUser: boolean = false) {
    this.docService.findExpired(fromCurrentUser);
  }
}
