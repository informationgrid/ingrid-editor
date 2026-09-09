/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
import { ResearchService } from "./research.service";
import { DocumentService } from "../services/document/document.service";
import { ConfigService } from "../services/config/config.service";
import { ProfileService } from "../services/profile.service";
import { QueryStore } from "../store/query/query.store";
import { GeneralStore } from "../store/general.store";
import { UiStore } from "../store/ui.store";
import { AddressTreeStore } from "../store/address-tree/address-tree.store";
import { DocumentTreeStore } from "../store/tree/document-tree.store";
import { ModalService } from "../services/modal/modal.service";
import { DocumentDataService } from "../services/document/document-data.service";
import { CatalogService } from "../+catalog/services/catalog.service";
import { FormMessageService } from "../services/form-message.service";
import { TranslocoService } from "@jsverse/transloco";
import { DocEventsService } from "../services/event/doc-events.service";

describe("Typed document searches", () => {
  let http: HttpTestingController;
  let research: ResearchService;
  let documents: DocumentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ResearchService,
        DocumentService,
        {
          provide: ConfigService,
          useValue: { getConfiguration: () => ({ backendUrl: "/api/" }) },
        },
        {
          provide: ProfileService,
          useValue: { getDocumentIcon: () => "document-icon" },
        },
        ...[
          QueryStore,
          GeneralStore,
          UiStore,
          AddressTreeStore,
          DocumentTreeStore,
          ModalService,
          DocumentDataService,
          CatalogService,
          FormMessageService,
          TranslocoService,
          DocEventsService,
        ].map((provide) => ({ provide, useValue: {} })),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    research = TestBed.inject(ResearchService);
    documents = TestBed.inject(DocumentService);
  });

  afterEach(() => http.verify());

  it("sends title text unchanged as data and preserves result metadata", async () => {
    const term = " O'Brien %_\\ '; SELECT 1; -- ";
    const response = firstValueFrom(documents.findInTitleOrUuid(term, 5));
    const request = http.expectOne("/api/search/titleOrUuid");
    expect(request.request.method).toBe("POST");
    expect(request.request.body).toEqual({
      term,
      category: "data",
      excludeFolders: false,
      pageSize: 5,
    });
    request.flush({
      totalHits: 12,
      hits: [
        {
          _id: 7,
          _uuid: "uuid",
          _type: "InGridGeoDataset",
          title: "Title",
          _tags: [],
          hasWritePermission: false,
        },
      ],
    });
    expect(await response).toMatchObject({
      totalHits: 12,
      hits: [
        {
          id: 7,
          _uuid: "uuid",
          title: "Title",
          icon: "document-icon",
          hasWritePermission: false,
        },
      ],
    });
    http.expectNone("/api/search/querySql");
  });

  it("supports empty address searches excluding folders", async () => {
    const response = firstValueFrom(
      documents.findInTitleOrUuid("", 1, true, true),
    );
    const request = http.expectOne("/api/search/titleOrUuid");
    expect(request.request.body).toEqual({
      term: "",
      category: "address",
      excludeFolders: true,
      pageSize: 1,
    });
    request.flush({ totalHits: 3, hits: [] });
    expect((await response).totalHits).toBe(3);
  });

  it("keeps the default page size", async () => {
    const response = firstValueFrom(documents.findInTitleOrUuid("title"));
    const request = http.expectOne("/api/search/titleOrUuid");
    expect(request.request.body.pageSize).toBe(10);
    request.flush({ totalHits: 0, hits: [] });
    await response;
  });

  it.each([true, false])(
    "returns the coupled service decision %s",
    async (exists) => {
      const uuid = "uuid'\\";
      const response = firstValueFrom(
        research.hasCoupledServiceWithGetCapabilities(uuid),
      );
      const request = http.expectOne(
        "/api/search/hasCoupledServiceWithGetCapabilities",
      );
      expect(request.request.body).toEqual({ uuid });
      request.flush(exists);
      expect(await response).toBe(exists);
    },
  );

  it("deduplicates HmbTG UUIDs while retaining equal titles", async () => {
    const response = firstValueFrom(
      research.getHmbtgDocumentTitles(["one", "one", "two,'{}"]),
    );
    const request = http.expectOne("/api/search/hmbtgDocumentTitles");
    expect(request.request.body).toEqual({ uuids: ["one", "two,'{}"] });
    request.flush(["Same title", "Same title"]);
    expect(await response).toEqual(["Same title", "Same title"]);
  });

  it("does not request HmbTG titles for an empty selection", async () => {
    expect(await firstValueFrom(research.getHmbtgDocumentTitles([]))).toEqual(
      [],
    );
    http.expectNone("/api/search/hmbtgDocumentTitles");
  });

  it("propagates request failures to the existing error handling", async () => {
    const response = firstValueFrom(
      research.hasCoupledServiceWithGetCapabilities("uuid"),
    );
    const assertion = expect(response).rejects.toMatchObject({ status: 500 });
    http
      .expectOne("/api/search/hasCoupledServiceWithGetCapabilities")
      .flush("error", { status: 500, statusText: "Error" });
    await assertion;
  });
});
