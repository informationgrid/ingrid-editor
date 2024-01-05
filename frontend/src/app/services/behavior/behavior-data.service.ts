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
import { Observable } from "rxjs";
import { ConfigService, Configuration } from "../config/config.service";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviourFormatBackend } from "./behaviour.service";

@Injectable({
  providedIn: "root",
})
export class BehaviorDataService {
  private configuration: Configuration;

  constructor(
    private http: HttpClient,
    configService: ConfigService,
  ) {
    this.configuration = configService.getConfiguration();
  }

  loadStoredBehaviours(): Observable<any[]> {
    return this.http.get<any[]>(this.configuration.backendUrl + "behaviours");
  }

  saveBehaviors(behavior: BehaviourFormatBackend[]): Observable<any> {
    return this.http.post(
      this.configuration.backendUrl + "behaviours",
      behavior,
    );
  }
}
