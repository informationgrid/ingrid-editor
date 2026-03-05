import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ConfigService, Configuration } from "../config/config.service";
import { Observable } from "rxjs";

export interface EvaluationResult {
  summary: string;
  evaluations: Array<Evaluation>;
}

export interface Evaluation {
  key: string;
  label: string;
  score: number;
  reasoning?: string;
  suggestions?: Array<string>;
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

  evaluateDataset(data: any): Observable<EvaluationResult> {
    return this.http.post<EvaluationResult>(
      `${this.configuration.backendUrl}ai/dataset/evaluate`,
      data,
    );
  }
}
