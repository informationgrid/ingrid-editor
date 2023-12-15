/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import { ConfigService } from "../../services/config/config.service";
import { Observable } from "rxjs";
import { BaseLogResult } from "../../shared/base-log-result";
import { shareReplay } from "rxjs/operators";

export interface UrlCheckReportDataset {
  field: string;
  title: string;
  type: string;
  uuid: string;
}

export interface UrlCheckReport {
  totalUrls: number;
  invalidUrls: UrlInfo[];
}
export interface UrlInfo {
  url: string;
  success: boolean;
  status: number;
  datasets: UrlCheckReportDataset[];
}

export interface UrlLogResult extends BaseLogResult {
  progress: number;
  report: UrlCheckReport;
}

@Injectable({
  providedIn: "root",
})
export class UrlCheckService {
  private backendURL = this.config.getConfiguration().backendUrl;
  private jobId = `url-check_${this.config.$userInfo.value.login}`;

  constructor(
    private http: HttpClient,
    private config: ConfigService,
  ) {}

  start(): Observable<void> {
    return this.sendCommand("start");
  }

  stop(): Observable<void> {
    return this.sendCommand("stop");
  }

  private sendCommand(command: "start" | "stop") {
    return this.http.post<void>(
      `${this.backendURL}jobs/url-check?command=${command}`,
      null,
    );
  }

  /*isRunning(): Observable<boolean> {
    return this.http.get<boolean>(
      this.backendURL + "jobs/url-check/is-running"
    );
  }*/

  getJobInfo() {
    return this.http
      .get<any>(this.backendURL + `jobs/${this.jobId}/info`)
      .pipe(shareReplay(1));
  }

  replaceUrl(source: UrlInfo, replaceUrl: string) {
    return this.http.post<any>(`${this.backendURL}jobs/url-check/replace`, {
      source,
      replaceUrl,
    });
  }
}
