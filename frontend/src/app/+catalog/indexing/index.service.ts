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
import { HttpClient } from "@angular/common/http";
import {
  ConfigService,
  Configuration,
} from "../../services/config/config.service";
import { Catalog } from "../services/catalog.model";
import { BehaviorSubject, Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { BaseLogResult } from "../../shared/base-log-result";

export interface LogResult extends BaseLogResult {
  targets: {
    name: string;
    numDocuments: number;
    numAddresses: number;
    progressDocuments: number;
    progressAddresses: number;
  }[];
}

interface IndexCronConfig {
  cronPattern: string;
  exports: IndexExportConfig[];
}

interface IndexExportConfig {
  target: string;
  exporterId: string;
  tags: string[];
}

@Injectable({
  providedIn: "root",
})
export class IndexService {
  private configuration: Configuration;
  private catalog: Catalog;
  lastLog$ = new BehaviorSubject<LogResult>(null);

  constructor(
    private http: HttpClient,
    configService: ConfigService,
  ) {
    this.configuration = configService.getConfiguration();
    this.catalog = configService.$userInfo.getValue().currentCatalog;
  }

  start() {
    return this.http.post(this.configuration.backendUrl + "index", null);
  }

  setCronPattern(value: string) {
    return this.http.post(this.configuration.backendUrl + "index/config/cron", {
      cronPattern: value,
    });
  }

  getIndexConfig(): Observable<IndexCronConfig> {
    return this.http.get<IndexCronConfig>(
      this.configuration.backendUrl + "index/config",
    );
  }

  fetchLastLog() {
    return this.http
      .get<any>(this.configuration.backendUrl + "index/log")
      .pipe(tap((response) => this.lastLog$.next(response)))
      .subscribe();
  }

  cancel() {
    return this.http
      .delete(this.configuration.backendUrl + "index/" + this.catalog.id)
      .subscribe();
  }

  setExportConfig(value: any) {
    return this.http.post(
      this.configuration.backendUrl + "index/config/exports",
      value,
    );
  }
}
