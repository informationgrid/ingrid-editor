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
import { Injectable } from "@angular/core";
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
    private dataService: CatalogDataService,
    private http: HttpClient,
    private catalogStore: CatalogStore,
    private snackbar: MatSnackBar,
    configService: ConfigService,
  ) {
    this.configuration = configService.getConfiguration();
  }

  getCatalogs(): Observable<Catalog[]> {
    return this.http
      .get<any[]>(this.configuration.backendUrl + "catalogs")
      .pipe(
        map((catalogs) =>
          catalogs.map((cat) => CatalogService.mapCatalog(cat)),
        ),
        map((catalogs) =>
          catalogs.sort((a, b) => a.label.localeCompare(b.label)),
        ),
        tap((catalogs) => this.catalogStore.set(catalogs)),
        tap((catalogs) => this.handleCatalogStatistics(catalogs)),
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
            /^Catalog '(.*)' already exists$/,
          );
          if (matches?.length > 1) {
            httpError.errorText = `Katalog '${matches[1]}' ist bereits vorhanden`;
          }
          err.error = httpError;
          throw err;
        }),
      );
  }

  updateCatalog(catalog: Catalog) {
    return this.http
      .put(
        this.configuration.backendUrl + "catalogs/" + catalog.id,
        CatalogService.prepareForBackend(catalog),
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
      this.configuration.backendUrl + "catalog/" + catalogId,
    );
  }

  getCatalogProfiles(): Observable<Profile[]> {
    return this.http.get<Profile[]>(this.configuration.backendUrl + "profiles");
  }

  private getCatalogStatistics(identifier: string) {
    return this.http.get<any>(
      `${this.configuration.backendUrl}catalogStatistic/${identifier}`,
    );
  }

  private handleCatalogStatistics(catalogs: Catalog[]) {
    catalogs.forEach((catalog) => {
      this.getCatalogStatistics(catalog.id).subscribe((statistic) =>
        this.addStatisticToStore(catalog.id, statistic),
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

  getExpiryDuration(): Observable<number> {
    return this.getConfig().pipe(
      map((config) => config.expiredDatasetConfig?.expiryDuration ?? 0),
    );
  }

  getConfig(): Observable<any> {
    return this.http
      .get<any>(this.configuration.backendUrl + "catalogConfig")
      .pipe(
        map((response) => ({
          ...response.config,
          catalogName: response.name,
          description: response.description,
        })),
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
