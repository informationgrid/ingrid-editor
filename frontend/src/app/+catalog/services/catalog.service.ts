import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import {
  ConfigService,
  Configuration,
} from "../../services/config/config.service";
import { Observable } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";
import { CatalogDataService } from "./catalog-data.service";
import { HttpClient } from "@angular/common/http";
import { Catalog } from "./catalog.model";
import { CatalogStore } from "../../store/catalog/catalog.store";
import { MatSnackBar } from "@angular/material/snack-bar";

export interface Profile {
  id: string;
  title: string;
  description: string;
}

@Injectable({
  providedIn: "root",
})
export class CatalogService {
  private configuration: Configuration;

  constructor(
    private router: Router,
    private dataService: CatalogDataService,
    private http: HttpClient,
    private catalogStore: CatalogStore,
    private snackbar: MatSnackBar,
    configService: ConfigService
  ) {
    this.configuration = configService.getConfiguration();
  }

  getCatalogs(): Observable<Catalog[]> {
    return this.http
      .get<any[]>(this.configuration.backendUrl + "catalogs")
      .pipe(
        map((catalogs) =>
          catalogs.map((cat) => CatalogService.mapCatalog(cat))
        ),
        tap((catalogs) => this.catalogStore.set(catalogs)),
        tap((catalogs) => this.handleCatalogStatistics(catalogs))
      );
  }

  switchCatalog(id: string): void {
    this.http
      .post(this.configuration.backendUrl + "user/catalog/" + id, null)
      .subscribe(() => {
        // get current location without parameters to avoid 404 errors
        const path = window.location.pathname.split(";")[0];
        window.location.href = path.replace(ConfigService.catalogId, id);
      });
  }

  createCatalog(catalog: Catalog) {
    return this.http
      .post(this.configuration.backendUrl + "catalogs", catalog)
      .pipe(
        catchError((err) => {
          const httpError = err.error;
          const matches = httpError.errorText?.match(
            /^Catalog '(.*)' already exists$/
          );
          if (matches?.length > 1) {
            httpError.errorText = `Katalog '${matches[1]}' ist bereits vorhanden`;
          }
          err.error = httpError;
          throw err;
        }),
        tap(() => this.getCatalogs().subscribe())
      );
  }

  updateCatalog(catalog: Catalog) {
    return this.http
      .put(
        this.configuration.backendUrl + "catalogs/" + catalog.id,
        CatalogService.prepareForBackend(catalog)
      )
      .pipe(tap(() => this.getCatalogs().subscribe()));
  }

  setCatalogAdmin(catalogName: string, userIds: string[]) {
    return this.dataService.setCatalogAdmin(catalogName, userIds);
  }

  deleteCatalog(catalogId: string) {
    return this.dataService
      .deleteCatalog(catalogId)
      .pipe(tap(() => this.getCatalogs().subscribe()));
  }

  getCatalog(catalogId: string) {
    return this.http.get(
      this.configuration.backendUrl + "catalog/" + catalogId
    );
  }

  getCatalogProfiles(): Observable<Profile[]> {
    return this.http.get<Profile[]>(this.configuration.backendUrl + "profiles");
  }

  private getCatalogStatistics(identifier: string) {
    return this.http.get<any>(
      `${this.configuration.backendUrl}catalogStatistic/${identifier}`
    );
  }

  private handleCatalogStatistics(catalogs: Catalog[]) {
    catalogs.forEach((catalog) => {
      this.getCatalogStatistics(catalog.id).subscribe((statistic) =>
        this.addStatisticToStore(catalog.id, statistic)
      );
    });
  }

  private addStatisticToStore(catalogId: string, statistic: any) {
    this.catalogStore.update(catalogId, (state) => {
      return {
        ...state,
        ...statistic,
      };
    });
  }

  static mapCatalog(catalog: any): Catalog {
    if (!catalog) return null;

    return {
      ...catalog,
      label: catalog.name,
    };
  }

  private static prepareForBackend(catalog: Catalog) {
    return {
      id: catalog.id,
      name: catalog.label,
      description: catalog.description,
      type: catalog.type,
    };
  }

  getConfig(): Observable<any> {
    return this.http
      .get<any>(this.configuration.backendUrl + "catalogConfig")
      .pipe(
        map((response) => ({
          ...response.config,
          catalogName: response.name,
          description: response.description,
        }))
      );
  }

  saveConfig(value: any) {
    const body = this.prepareBody(value);
    this.http
      .put(this.configuration.backendUrl + "catalogConfig", body)
      .pipe(tap(() => this.snackbar.open("Konfiguration wurde gespeichert")))
      .subscribe();
  }

  private prepareBody(value: any) {
    const name = value.catalogName;
    const description = value.description;
    delete value.name;
    delete value.description;
    return {
      name: name,
      description: description,
      config: value,
    };
  }
}
