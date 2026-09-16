/*
 * ==================================================
 * Copyright (C) 2026 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 */
import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ConfigService } from "../../app/services/config/config.service";

@Injectable({ providedIn: "root" })
export class IngridDocumentSearchService {
  private http = inject(HttpClient);
  private configuration = inject(ConfigService).getConfiguration();

  hasCoupledServiceWithGetCapabilities(uuid: string): Observable<boolean> {
    return this.http.post<boolean>(
      `${this.configuration.backendUrl}ingrid/search/hasCoupledServiceWithGetCapabilities`,
      { uuid },
    );
  }
}
