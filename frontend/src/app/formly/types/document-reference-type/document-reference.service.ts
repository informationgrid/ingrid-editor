import { Injectable } from "@angular/core";
import {
  ConfigService,
  Configuration,
} from "../../../services/config/config.service";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

export interface GetRecordAnalysis {
  title: string;
  uuid: string;
  identifier: string;
  downloadData: string[];
}

@Injectable({
  providedIn: "root",
})
export class DocumentReferenceService {
  private configuration: Configuration;

  constructor(
    private http: HttpClient,
    configService: ConfigService,
  ) {
    this.configuration = configService.getConfiguration();
  }

  analyzeGetRecordUrl(url: string): Observable<GetRecordAnalysis> {
    return this.http.post<GetRecordAnalysis>(
      `${this.configuration.backendUrl}getCapabilities/analyzeGetRecordUrl`,
      url,
    );
  }
}
