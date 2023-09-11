import { Component, OnInit } from "@angular/core";
import { ConfigService } from "../../services/config/config.service";
import { CatalogQuery } from "../../store/catalog/catalog.query";
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
import { catchError, filter, finalize, map, tap } from "rxjs/operators";
import { combineLatest, Observable } from "rxjs";
import { SessionService } from "../../services/session.service";

@Component({
  selector: "ige-catalog-management",
  templateUrl: "./catalog-management.component.html",
  styleUrls: ["./catalog-management.component.scss"],
})
export class CatalogManagementComponent implements OnInit {
  // TODO: there is a race condition .... catalogs are often not loaded in time before
  //       calling mapProfileTitleToCatalog
  private catalogs = combineLatest([
    this.catalogQuery.selectAll(),
    this.catalogService
      .getCatalogProfiles()
      .pipe(tap((profiles) => (this.profiles = profiles))),
  ]);

  activeCatalog = this.catalogs.pipe(
    map((catalog) => {
      const active = catalog[0].find((cat) => cat.id === this.currentCatalog);
      return active ? this.mapProfileTitleToCatalog(active, catalog[1]) : null;
    })
  );

  nonActiveCatalogs = this.catalogs.pipe(
    map((catalog) => {
      const other = catalog[0].filter((cat) => cat.id !== this.currentCatalog);
      return other.map((cat) => this.mapProfileTitleToCatalog(cat, catalog[1]));
    })
  );

  noAssignedCatalogs = false;
  showSpinner = false;
  currentCatalog: string;
  private currentUserID: string;
  profiles: Profile[];
  trackByCatalogId = (index, item: Catalog) => {
    return item.id;
  };

  constructor(
    private catalogService: CatalogService,
    private configService: ConfigService,
    private sessionService: SessionService,
    private catalogQuery: CatalogQuery,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.catalogService.getCatalogs().subscribe();

    this.configService.$userInfo.subscribe((info) => {
      this.currentUserID = info.login;
      this.noAssignedCatalogs = info.assignedCatalogs.length === 0;
      this.currentCatalog = info.currentCatalog?.id;
    });
  }

  showCreateCatalogDialog() {
    this.dialog
      .open(NewCatalogDialogComponent, {
        minWidth: 400,
        hasBackdrop: true,
        disableClose: true,
        data: this.profiles,
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
        catchError((err) => this.handleCreateError(err))
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

  private handleCreateError(err): Observable<Error> {
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
        minWidth: 350,
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
