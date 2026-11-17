/*
 * ==================================================
 * Copyright (C) 2026 wemove digital solutions GmbH
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
import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { ConfigService } from "../../app/services/config/config.service";

@Injectable({ providedIn: "root" })
export class HmdkDocumentSearchService {
  private http = inject(HttpClient);
  private configuration = inject(ConfigService).getConfiguration();

  /**
   * Retrieves document titles for HMB-TG documents.
   *
   * Fetches titles for documents with publicationHmbTG flag set to true,
   * filtered by the provided UUIDs. Returns an empty array if no UUIDs are provided.
   *
   * @param uuids Array of document UUIDs to retrieve titles for
   * @returns Observable of string array containing the document titles
   */
  getHmbtgDocumentTitles(uuids: string[]): Observable<string[]> {
    if (uuids.length === 0) return of([]);
    return this.http.post<string[]>(
      `${this.configuration.backendUrl}ingrid-hmdk/search/hmbtgDocumentTitles`,
      { uuids: [...new Set(uuids)] },
    );
  }
}
