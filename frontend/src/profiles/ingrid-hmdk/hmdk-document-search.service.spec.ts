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
import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { firstValueFrom } from "rxjs";
import { ConfigService } from "../../app/services/config/config.service";
import { HmdkDocumentSearchService } from "./hmdk-document-search.service";

describe("HmdkDocumentSearchService", () => {
  let service: HmdkDocumentSearchService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        HmdkDocumentSearchService,
        {
          provide: ConfigService,
          useValue: { getConfiguration: () => ({ backendUrl: "/api/" }) },
        },
      ],
    });
    service = TestBed.inject(HmdkDocumentSearchService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it("deduplicates UUIDs while retaining equal titles", async () => {
    const response = firstValueFrom(
      service.getHmbtgDocumentTitles(["one", "one", "two,'{}"]),
    );
    const request = http.expectOne(
      "/api/ingrid-hmdk/search/hmbtgDocumentTitles",
    );
    expect(request.request.body).toEqual({ uuids: ["one", "two,'{}"] });
    request.flush(["Same title", "Same title"]);
    expect(await response).toEqual(["Same title", "Same title"]);
  });

  it("does not request titles for an empty selection", async () => {
    expect(await firstValueFrom(service.getHmbtgDocumentTitles([]))).toEqual(
      [],
    );
    http.expectNone("/api/ingrid-hmdk/search/hmbtgDocumentTitles");
  });

  it("propagates request failures", async () => {
    const response = firstValueFrom(service.getHmbtgDocumentTitles(["uuid"]));
    const assertion = expect(response).rejects.toMatchObject({ status: 500 });
    http
      .expectOne("/api/ingrid-hmdk/search/hmbtgDocumentTitles")
      .flush("error", { status: 500, statusText: "Error" });
    await assertion;
  });
});
