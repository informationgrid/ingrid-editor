/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import {
  Component,
  computed,
  inject,
  OnInit,
  Signal,
  signal,
} from "@angular/core";
import { ConfigService } from "../services/config/config.service";
import { DocumentService } from "../services/document/document.service";
import { DocumentAbstract } from "../store/document/document.model";
import { BehaviorSubject } from "rxjs";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import {
  CreateNodeComponent,
  CreateOptions,
} from "../+form/dialogs/create/create-node.component";
import { MessageService } from "../services/messages/message.service";
import { Message } from "../services/messages/message";
import { TranslocoDirective } from "@jsverse/transloco";
import { QuickSearchComponent } from "./quick-search/quick-search.component";
import { ActionButtonComponent } from "../shared/action-button/action-button.component";
import { CardBoxComponent } from "../shared/card-box/card-box.component";
import { ChartComponent } from "./chart/chart.component";
import { DocumentListItemComponent } from "../shared/document-list-item/document-list-item.component";
import { AsyncPipe } from "@angular/common";
import { GeneralStore } from "../store/general.store";
import { MATOMO_DIRECTIVES } from "ngx-matomo-client";
import { DashboardService } from "./dashboard.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { tap } from "rxjs/operators";
import { CatalogService } from "../+catalog/services/catalog.service";

@UntilDestroy()
@Component({
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
  imports: [
    TranslocoDirective,
    QuickSearchComponent,
    ActionButtonComponent,
    CardBoxComponent,
    ChartComponent,
    DocumentListItemComponent,
    AsyncPipe,
    MATOMO_DIRECTIVES,
  ],
})
export class DashboardComponent implements OnInit {
  private generalStore = inject(GeneralStore);

  canCreateAddress: boolean;
  canCreateDataset: boolean;
  canImport: boolean;
  onlyModifiedFromCurrentUser = signal<boolean>(false);
  onlyPublishedFromCurrentUser = signal<boolean>(false);

  recentlyModifiedDocs = this.dashboardService.fetchRecentDocs(
    this.onlyModifiedFromCurrentUser,
    false,
  );
  recentlyPublishedDocs = this.dashboardService.fetchRecentDocs(
    this.onlyPublishedFromCurrentUser,
    true,
  );

  oldestExpiredDocs: Signal<DocumentAbstract[]> = computed(() => {
    return this.generalStore.oldestExpiredDocuments().slice(0, 5);
  });
  chartDataPublished = signal<number[]>(null);
  messages$: BehaviorSubject<Message[]>;

  constructor(
    configService: ConfigService,
    private router: Router,
    private dialog: MatDialog,
    private docService: DocumentService,
    private messageService: MessageService,
    private dashboardService: DashboardService,
    private catalogService: CatalogService,
  ) {
    this.messages$ = this.messageService.messages$;
    this.canCreateAddress = configService.hasPermission("can_create_address");
    this.canCreateDataset = configService.hasPermission("can_create_dataset");
    this.canImport = configService.hasPermission("can_import");
  }

  ngOnInit() {
    this.fetchStatistic();
    this.catalogService
      .getExpiryDuration()
      .pipe(
        untilDestroyed(this),
        // update Expired documents if expiry duration is set
        tap((expiryDuration) =>
          expiryDuration > 0 ? this.updateExpired() : null,
        ),
      )
      .subscribe();
    this.messageService.loadStoredMessages();
  }

  fetchStatistic() {
    this.docService.getStatistic().subscribe((response) => {
      this.chartDataPublished.set([response.numDrafts, response.numPublished]);
    });
  }

  createNewDocument() {
    this.dialog.open(CreateNodeComponent, {
      maxWidth: 600,
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
      maxWidth: 600,
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
      maxWidth: 600,
      disableClose: true,
      hasBackdrop: true,
      data: {
        forAddress: false,
        isFolder: true,
      } as CreateOptions,
    });
  }

  showExpiredFromCurrentUser = signal<boolean>(false);
  updateExpired(fromCurrentUser: boolean = false) {
    this.docService.findExpired(fromCurrentUser);
    this.showExpiredFromCurrentUser.set(fromCurrentUser);
  }
}
