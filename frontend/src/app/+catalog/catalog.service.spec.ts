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
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";

describe("CatalogService", () => {
  let spectator: SpectatorService<CatalogService>;
  const createService = createServiceFactory({
    service: CatalogService,
    imports: [HttpClientTestingModule, MatSnackBarModule],
    providers: [
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
            [
              {
                title: "Verwaltung",
                adminOnly: true,
                entries: [
                  {
                    label: "Allgemein",
                    isRouterLink: true,
                    link: "/settings/general",
                  },
                  {
                    label: "Codelist Repository",
                    isRouterLink: true,
                    link: "/settings/codelist",
                  },
                  {
                    label: "Katalogverwaltung",
                    isRouterLink: true,
                    link: "/settings/catalog",
                  },
                ],
              },
              {
                title: "Informationen",
                adminOnly: false,
                entries: [
                  {
                    label: "Hilfe",
                    isRouterLink: false,
                    link: "#",
                  },
                ],
              },
            ],
            "",
            ""
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
