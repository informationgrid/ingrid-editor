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
import { CatalogService } from "./services/catalog.service";
import {
  createServiceFactory,
  mockProvider,
  SpectatorService,
} from "@ngneat/spectator";
import { Router } from "@angular/router";
import { CatalogDataService } from "./services/catalog-data.service";
import {
  ConfigService,
  Configuration,
} from "../services/config/config.service";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";

describe("CatalogService", () => {
  let spectator: SpectatorService<CatalogService>;
  const createService = createServiceFactory({
    service: CatalogService,
    imports: [MatSnackBarModule],
    providers: [
      provideHttpClient(withInterceptorsFromDi()),
      provideHttpClientTesting(),
      mockProvider(ConfigService, {
        getConfiguration: () =>
          new Configuration(
            "/keycloak",
            "Test",
            "Client",
            false,
            "/",
            "/api",
            null,
            null,
            null,
            "",
            "",
            "",
            "",
            "",
            "",
            true,
          ),
      }),
    ],
    mocks: [Router, CatalogDataService],
  });

  beforeEach(() => {
    spectator = createService();
  });

  it("should get catalogs", () => {
    spectator.service
      .getCatalogs()
      .subscribe((catalogs) => expect(catalogs.length).toBeEmpty());
  });
});
