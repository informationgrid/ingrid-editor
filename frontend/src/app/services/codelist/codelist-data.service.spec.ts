/*
 * ==================================================
 * Copyright (C) 2024-2026 wemove digital solutions GmbH
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
import {
  provideHttpClientTesting,
  HttpTestingController,
} from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { CodelistDataService } from "./codelist-data.service";
import { ConfigService } from "../config/config.service";

describe("CodelistDataService", () => {
  let service: CodelistDataService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CodelistDataService,
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ConfigService,
          useValue: {
            getConfiguration: () => ({
              backendUrl: "http://localhost:8080/api/",
            }),
          },
        },
      ],
    });

    service = TestBed.inject(CodelistDataService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it("should pass the filter and page as query parameters in getExternalCodelist including strings with slashes", () => {
    const rawFilter = "DE_42/83 / GK_3";
    service.getExternalCodelist("EPSG", rawFilter, 1).subscribe();

    const req = httpTesting.expectOne(
      (request) =>
        request.url === "http://localhost:8080/api/codelist/external/EPSG" &&
        request.params.get("filter") === rawFilter &&
        request.params.get("page") === "1",
    );

    expect(req.request.method).toBe("GET");
    expect(req.request.params.get("filter")).toBe("DE_42/83 / GK_3");
    expect(req.request.params.get("page")).toBe("1");
    req.flush({});
  });
});
