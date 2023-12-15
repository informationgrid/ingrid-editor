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
