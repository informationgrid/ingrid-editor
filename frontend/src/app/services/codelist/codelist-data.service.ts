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
import { HttpClient } from "@angular/common/http";
import { ConfigService, Configuration } from "../config/config.service";
import { Injectable } from "@angular/core";
import { CodelistBackend } from "../../store/codelist/codelist.model";

@Injectable({
  providedIn: "root",
})
export class CodelistDataService {
  private configuration: Configuration;

  constructor(
    private http: HttpClient,
    configService: ConfigService,
  ) {
    this.configuration = configService.getConfiguration();
  }

  byIds(ids: string[]) {
    return this.http.get<CodelistBackend[]>(
      this.configuration.backendUrl + "codelist/" + ids.join(","),
    );
  }

  update() {
    return this.http.post<CodelistBackend[]>(
      this.configuration.backendUrl + "codelist",
      null,
    );
  }

  getAll() {
    return this.http.get<CodelistBackend[]>(
      this.configuration.backendUrl + "codelist",
    );
  }

  getCatalogCodelists() {
    return this.http.get<CodelistBackend[]>(
      this.configuration.backendUrl + "codelist/manage",
    );
  }

  updateCodelist(codelist: CodelistBackend) {
    return this.http.put<CodelistBackend[]>(
      this.configuration.backendUrl + "codelist/manage/" + codelist.id,
      codelist,
    );
  }

  resetCodelist(id: string) {
    return this.http.delete<CodelistBackend[]>(
      this.configuration.backendUrl + "codelist/manage/" + id,
    );
  }
}
