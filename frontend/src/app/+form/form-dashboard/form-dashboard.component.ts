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
  effect,
  inject,
  Input,
  OnInit,
  Signal,
} from "@angular/core";
import { DocumentAbstract } from "../../store/document/document.model";
import { Router } from "@angular/router";
import { DocumentService } from "../../services/document/document.service";
import { ConfigService } from "../../services/config/config.service";
import { UntilDestroy } from "@ngneat/until-destroy";
import { DashboardAddressHeaderComponent } from "./dashboard-address-header/dashboard-address-header.component";
import { DashboardDocsHeaderComponent } from "./dashboard-docs-header/dashboard-docs-header.component";
import { CardBoxComponent } from "../../shared/card-box/card-box.component";
import { DocumentListItemComponent } from "../../shared/document-list-item/document-list-item.component";
import { MatIcon } from "@angular/material/icon";
import { TranslocoDirective } from "@ngneat/transloco";
import { GeneralStore } from "../../store/general.store";

@UntilDestroy()
@Component({
  selector: "ige-form-dashboard",
  templateUrl: "./form-dashboard.component.html",
  styleUrls: ["./form-dashboard.component.scss"],
  imports: [
    DashboardAddressHeaderComponent,
    DashboardDocsHeaderComponent,
    CardBoxComponent,
    DocumentListItemComponent,
    MatIcon,
    TranslocoDirective,
  ],
})
export class FormDashboardComponent implements OnInit {
  @Input() address = false;

  private generalStore = inject(GeneralStore);

  childDocs: Signal<DocumentAbstract[]>;
  canCreateDatasets: boolean;
  canCreateAddress: boolean;
  canImport: boolean;

  constructor(
    configService: ConfigService,
    private router: Router,
    private docService: DocumentService,
  ) {
    // TODO switch to user specific query
    this.canCreateDatasets = configService.hasPermission("can_create_dataset");
    this.canCreateAddress = configService.hasPermission("can_create_address");
    this.canImport = configService.hasPermission("can_import");

    effect(() => {
      const doc = this.generalStore.getOpenedDocument(this.address);
      if (doc === null) {
        this.address
          ? this.docService.findRecentAddresses()
          : this.updateRecentDocs();
      }
    });
  }

  ngOnInit(): void {
    this.childDocs = this.address
      ? this.generalStore.latestAddresses
      : this.generalStore.latestDocuments;
  }

  openDocument(uuid: string) {
    const target =
      ConfigService.catalogId + (this.address ? "/address" : "/form");
    this.router.navigate([target, { id: uuid }]);
  }

  private updateRecentDocs() {
    this.docService.findRecentDrafts();
    this.docService.findRecentPublished();
  }
}
