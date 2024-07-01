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
import { Observable } from "rxjs";
import { BaseLogResult } from "../../shared/base-log-result";
import { map } from "rxjs/operators";

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

  constructor(
    private http: HttpClient,
    configService: ConfigService,
  ) {
    this.configuration = configService.getConfiguration();
  }

  start() {
    return this.http.post(
      this.configuration.backendUrl + "jobs/index?command=start",
      null,
    );
  }

  setCronPattern(value: string) {
    return this.http.post(this.configuration.backendUrl + "index/config/cron", {
      cronPattern: value.trim(),
    });
  }

  getIndexConfig(): Observable<IndexCronConfig> {
    return this.http.get<IndexCronConfig>(
      this.configuration.backendUrl + "index/config",
    );
  }

  fetchLastLog() {
    return this.http
      .get<any>(`${this.configuration.backendUrl}jobs/index/info`)
      .pipe(
        map((data) => {
          return <LogResult>{
            ...data.info,
            targets: data.info?.report,
          };
        }),
      );
  }

  cancel() {
    return this.http
      .post(this.configuration.backendUrl + "jobs/index?command=stop", null)
      .subscribe();
  }

  setExportConfig(value: any) {
    return this.http.post(
      this.configuration.backendUrl + "index/config/exports",
      value,
    );
  }
}
