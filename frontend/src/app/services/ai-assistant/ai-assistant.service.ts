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
import { Observable } from "rxjs";

export interface EvaluationResult {
  uuid: string;
  title: string;
  summary: string;
  totalScore: number;
  totalSuggestionCount?: number;
  evaluations: Array<Evaluation>;
}

export interface Evaluation {
  key: string;
  label: string;
  score?: number;
  originalValue?: string;
  reasoning?: string;
  suggestions?: Array<string>;
}

export interface AiSettings {
  hostUrl: string;
  modelId: string;
  apiToken: string;
  systemPrompt?: string;
  effort?: string;
}

@Injectable({
  providedIn: "root",
})
export class AiAssistantService {
  private configuration: Configuration;

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

  evaluateDataset(data: any): Observable<EvaluationResult> {
    return this.http.post<EvaluationResult>(
      this.configuration.backendUrl + "ai/dataset/evaluate",
      data,
    );
  }

  evaluateAll() {
    return this.http.post<{ data: EvaluationResult[] }>(
      this.configuration.backendUrl + "ai/dataset/evaluateAll",
      null,
    );
  }

  getLatestReport() {
    return this.http.get<{ data: EvaluationResult[] }>(
      this.configuration.backendUrl + "ai/dataset/latestReport",
    );
  }
}
