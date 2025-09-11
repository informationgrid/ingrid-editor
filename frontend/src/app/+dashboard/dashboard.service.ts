/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import { Injectable, signal, Signal } from "@angular/core";
import {
  httpResource,
  HttpResourceOptions,
  HttpResourceRef,
  HttpResourceRequest,
} from "@angular/common/http";
import { ResearchResponse } from "../+research/research.service";
import {
  ConfigService,
  Configuration,
} from "../services/config/config.service";
import { DocumentAbstract } from "../store/document/document.model";
import { DocumentService } from "../services/document/document.service";

@Injectable({
  providedIn: "root",
})
export class DashboardService {
  private configuration: Configuration;

  constructor(
    configService: ConfigService,
    private documentService: DocumentService,
  ) {
    this.configuration = configService.getConfiguration();
  }

  fetchRecentDocs(
    onlyFromUser: () => boolean = () => false,
    recentlyPublished: boolean = false,
    forAddresses: Signal<boolean> = signal(false),
  ): HttpResourceRef<DocumentAbstract[]> {
    return httpResource<DocumentAbstract[]>(
      () =>
        ({
          url: `${this.configuration.backendUrl}statistic/recentDocuments`,
          params: {
            fromUser: onlyFromUser(),
            recentlyPublished: recentlyPublished,
            addresses: forAddresses(),
          },
        }) as HttpResourceRequest,
      {
        parse: (researchResponse: ResearchResponse) =>
          this.documentService
            .mapSearchResults(researchResponse)
            .hits.slice(0, 5),
      } as HttpResourceOptions<DocumentAbstract[], ResearchResponse>,
    );
  }
}
