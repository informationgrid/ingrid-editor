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
import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { ConfigService } from "../../services/config/config.service";
import { MatDialog } from "@angular/material/dialog";
import { Catalog } from "../../+catalog/services/catalog.model";
import {
  CatalogService,
  Profile,
} from "../../+catalog/services/catalog.service";
import {
  CatalogDetailComponent,
  CatalogDetailResponse,
} from "./catalog-detail/catalog-detail.component";
import { NewCatalogDialogComponent } from "./new-catalog/new-catalog-dialog.component";
import { catchError, filter, finalize, tap } from "rxjs/operators";
import { Observable } from "rxjs";
import { PageTemplateComponent } from "../../shared/page-template/page-template.component";
import { AddButtonComponent } from "../../shared/add-button/add-button.component";
import { DatePipe, DecimalPipe, NgTemplateOutlet } from "@angular/common";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatCard, MatCardContent } from "@angular/material/card";
import { MatIcon } from "@angular/material/icon";
import { MatIconButton } from "@angular/material/button";
import { MatTooltip } from "@angular/material/tooltip";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { CatalogStore } from "../../store/catalog/catalog.store";

@Component({
  selector: "ige-catalog-management",
  templateUrl: "./catalog-management.component.html",
  styleUrls: ["./catalog-management.component.scss"],
  standalone: true,
  imports: [
    PageTemplateComponent,
    AddButtonComponent,
    NgTemplateOutlet,
    MatProgressSpinner,
    MatCard,
    MatCardContent,
    MatIcon,
    MatIconButton,
    MatTooltip,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    DecimalPipe,
    DatePipe,
  ],
})
export class CatalogManagementComponent implements OnInit {
  private catalogStore = inject(CatalogStore);

  activeCatalog = computed(() => {
    const active = this.catalogStore.entityMap()[this.currentCatalog];
    return active
      ? this.mapProfileTitleToCatalog(active, this.profiles())
      : null;
  });

  nonActiveCatalogs = computed(() => {
    return this.catalogStore
      .entities()
      .filter((cat) => cat.id !== this.currentCatalog)
      .map((cat) => this.mapProfileTitleToCatalog(cat, this.profiles()));
  });

  noAssignedCatalogs = false;
  showSpinner = false;
  currentCatalog: string;
  private currentUserID: string;
  profiles = signal<Profile[]>([]);

  constructor(
    private catalogService: CatalogService,
    private configService: ConfigService,
    private dialog: MatDialog,
  ) {
    this.catalogService
      .getCatalogProfiles()
      .pipe(tap((profiles) => this.profiles.set(profiles)))
      .subscribe();
    this.catalogService.getCatalogs().subscribe();
  }

  ngOnInit() {
    this.configService.$userInfo.subscribe((info) => {
      this.currentUserID = info.login;
      this.noAssignedCatalogs = info.assignedCatalogs.length === 0;
      this.currentCatalog = info.currentCatalog?.id;
    });
  }

  showCreateCatalogDialog() {
    this.dialog
      .open(NewCatalogDialogComponent, {
        minWidth: "min(400px, 100%)",
        hasBackdrop: true,
        disableClose: true,
        data: this.profiles(),
      })
      .afterClosed()
      .pipe(filter((catalog) => catalog))
      .subscribe((catalog: Catalog) => this.createCatalog(catalog));
  }

  private createCatalog(catalog: Catalog) {
    this.showSpinner = true;
    this.catalogService
      .createCatalog(catalog)
      .pipe(
        tap((response: Catalog) => {
          this.initCatalogAdminAndReloadCatalogs(response);
          this.switchCatalogIfNoCurrentCatalog(response);
        }),
        finalize(() => (this.showSpinner = false)),
        catchError((err) => this.handleCreateError(err)),
      )
      .subscribe();
  }

  private initCatalogAdminAndReloadCatalogs(catalog: Catalog) {
    return this.catalogService
      .setCatalogAdmin(catalog.id, [this.currentUserID])
      .pipe(tap(() => this.catalogService.getCatalogs().subscribe()))
      .subscribe();
  }

  private switchCatalogIfNoCurrentCatalog(response: Catalog) {
    if (!this.currentCatalog) {
      this.chooseCatalog(response.id);
    }
  }

  private handleCreateError(err: Error): Observable<Error> {
    this.showSpinner = false;
    throw err;
  }

  chooseCatalog(id: string) {
    this.catalogService.switchCatalog(id);
  }

  showCatalogDetail(catalog: Catalog) {
    this.dialog
      .open(CatalogDetailComponent, {
        data: { ...catalog },
        disableClose: true,
        minWidth: "min(350px, 100%)",
      })
      .afterClosed()
      .subscribe((response: CatalogDetailResponse) => {
        if (response) {
          if (response.deleted) {
            this.catalogService.deleteCatalog(catalog.id).subscribe();
          } else {
            this.catalogService.updateCatalog(response.settings).subscribe();
          }
        }
      });
  }

  private mapProfileTitleToCatalog(catalog: Catalog, profiles: Profile[]) {
    return {
      ...catalog,
      type:
        profiles.find((profile) => profile.id === catalog.type)?.title ??
        `Unbekannt: ${catalog.type}`,
    };
  }
}
