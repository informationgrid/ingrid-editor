/*
 * ==================================================
 * Copyright (C) 2026 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 */
import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { firstValueFrom } from "rxjs";
import { ConfigService } from "../../app/services/config/config.service";
import { IngridDocumentSearchService } from "./ingrid-document-search.service";

describe("IngridDocumentSearchService", () => {
  let service: IngridDocumentSearchService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        IngridDocumentSearchService,
        {
          provide: ConfigService,
          useValue: { getConfiguration: () => ({ backendUrl: "/api/" }) },
        },
      ],
    });
    service = TestBed.inject(IngridDocumentSearchService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it.each([true, false])(
    "returns the coupled service decision %s",
    async (exists) => {
      const uuid = "uuid'\\";
      const response = firstValueFrom(
        service.hasCoupledServiceWithGetCapabilities(uuid),
      );
      const request = http.expectOne(
        "/api/ingrid/search/hasCoupledServiceWithGetCapabilities",
      );
      expect(request.request.body).toEqual({ uuid });
      request.flush(exists);
      expect(await response).toBe(exists);
    },
  );

  it("propagates request failures", async () => {
    const response = firstValueFrom(
      service.hasCoupledServiceWithGetCapabilities("uuid"),
    );
    const assertion = expect(response).rejects.toMatchObject({ status: 500 });
    http
      .expectOne("/api/ingrid/search/hasCoupledServiceWithGetCapabilities")
      .flush("error", { status: 500, statusText: "Error" });
    await assertion;
  });
});
