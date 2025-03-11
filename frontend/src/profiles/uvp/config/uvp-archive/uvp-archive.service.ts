/**
 * ==================================================
 * Copyright (C) 2025 wemove digital solutions GmbH
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
import { ConfigService } from "../../../../app/services/config/config.service";
import { Observable } from "rxjs";

@Injectable()
export class UvpArchiveService {
  private http = inject(HttpClient);
  private configuration = inject(ConfigService).getConfiguration();

  archive(date: Date): Observable<any> {
    return this.http.post(`${this.configuration.backendUrl}uvp/archive`, {
      date,
    });
  }

  checkDatasetsBeforeDecisionDate(date: Date) {
    return this.http.post(
      `${this.configuration.backendUrl}uvp/archive/check`,
      date,
    );
  }
}
