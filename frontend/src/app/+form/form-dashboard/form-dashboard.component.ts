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
import { Component, input, signal } from "@angular/core";
import { Router } from "@angular/router";
import { ConfigService } from "../../services/config/config.service";
import { UntilDestroy } from "@ngneat/until-destroy";
import { DashboardAddressHeaderComponent } from "./dashboard-address-header/dashboard-address-header.component";
import { DashboardDocsHeaderComponent } from "./dashboard-docs-header/dashboard-docs-header.component";
import { CardBoxComponent } from "../../shared/card-box/card-box.component";
import { DocumentListItemComponent } from "../../shared/document-list-item/document-list-item.component";
import { MatIcon } from "@angular/material/icon";
import { TranslocoDirective } from "@jsverse/transloco";
import { DashboardService } from "../../+dashboard/dashboard.service";

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
export class FormDashboardComponent {
  address = input<boolean>(false);

  onlyModifiedFromCurrentUser = signal<boolean>(false);

  childDocs = this.dashboardService.fetchRecentDocs(
    this.onlyModifiedFromCurrentUser,
    false,
    this.address,
  );
  canCreateDatasets: boolean;
  canCreateAddress: boolean;
  canImport: boolean;

  constructor(
    configService: ConfigService,
    private router: Router,
    private dashboardService: DashboardService,
  ) {
    this.canCreateDatasets = configService.hasPermission("can_create_dataset");
    this.canCreateAddress = configService.hasPermission("can_create_address");
    this.canImport = configService.hasPermission("can_import");
  }

  openDocument(uuid: string) {
    const target =
      ConfigService.catalogId + (this.address() ? "/address" : "/form");
    this.router.navigate([target, { id: uuid }]);
  }
}
