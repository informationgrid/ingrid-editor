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
import { Observable } from "rxjs";
import {
  ConfigService,
  Configuration,
} from "../../services/config/config.service";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class CatalogDataService {
  private configuration: Configuration;

  constructor(
    private http: HttpClient,
    configService: ConfigService,
  ) {
    this.configuration = configService.getConfiguration();
  }

  getCatalogs(): Observable<any[]> {
    return this.http.get<string[]>(this.configuration.backendUrl + "catalogs");
  }

  createCatalog(name: string) {
    return this.http
      .post(this.configuration.backendUrl + "catalogs/" + name, null)
      .pipe
      // catchError( err => this.errorService.handle( err ) )
      ();
  }

  setCatalogAdmin(catalogName: string, userIds: string[]) {
    return this.http.post(
      this.configuration.backendUrl + "info/setCatalogAdmin",
      {
        catalogName: catalogName,
        userIds: userIds,
      },
    );
  }

  deleteCatalog(name: string) {
    return this.http.delete(this.configuration.backendUrl + "catalogs/" + name);
  }
}
