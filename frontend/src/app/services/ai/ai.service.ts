/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
import { ConfigService, Configuration } from "../config/config.service";
import {
  catchError,
  finalize,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
} from "rxjs";

export interface EvaluationResult {
  uuid: string;
  summary: string;
  averageScore: number;
  evaluations: Evaluation[];
}

export interface Evaluation {
  key: string;
  name: string;
  score: number;
  reason: string;
  options?: any[];
}

export interface AiSettings {
  hostUrl?: string;
  modelId?: string;
  apiKey?: string;
  roleDefinition?: string;
  instruction?: string;
}

@Injectable({
  providedIn: "root",
})
export class AiService {
  private configuration: Configuration;

  /** Running evaluation result requests per dataset uuid. */
  private pendingResults = new Map<string, Observable<EvaluationResult>>();

  constructor(
    private http: HttpClient,
    configService: ConfigService,
  ) {
    configService.$userInfo.subscribe(
      () => (this.configuration = configService.getConfiguration()),
    );
  }

  getSettings(): Observable<AiSettings> {
    return this.http.get<AiSettings>(
      this.configuration.backendUrl + "ai/settings",
    );
  }

  saveSettings(settings: AiSettings): Observable<AiSettings> {
    return this.http.put<AiSettings>(
      this.configuration.backendUrl + "ai/settings",
      settings,
    );
  }

  evaluateDataset(uuid: String): Observable<EvaluationResult> {
    return this.http.post<EvaluationResult>(
      this.configuration.backendUrl + "ai/dataset/evaluate",
      uuid,
    );
  }

  evaluateAll() {
    return this.http.post<EvaluationResult[]>(
      this.configuration.backendUrl + "ai/dataset/evaluateAll",
      null,
    );
  }

  getLatestReport() {
    return this.http.get<EvaluationResult[]>(
      this.configuration.backendUrl + "ai/dataset/latestReport",
    );
  }

  /**
   * Returns the evaluation result of a dataset. An existing result from the
   * latest report is used, otherwise the dataset is evaluated.
   *
   * Callers asking for the same dataset while a request is still running
   * share that request, so the dataset is not evaluated several times. The
   * request is canceled only when all callers have unsubscribed.
   */
  getEvaluationResult(uuid: string): Observable<EvaluationResult> {
    const pending = this.pendingResults.get(uuid);
    if (pending) return pending;

    const request = this.getLatestReport().pipe(
      map((report) => report?.find((entry) => entry.uuid === uuid) ?? null),
      // a missing or failing report should not prevent the evaluation
      catchError(() => of(null)),
      switchMap((result) => (result ? of(result) : this.evaluateDataset(uuid))),
      // runs on success, error or when all callers have unsubscribed
      finalize(() => this.pendingResults.delete(uuid)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
    this.pendingResults.set(uuid, request);
    return request;
  }
}
