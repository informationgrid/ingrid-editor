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
import { createComponentFactory, Spectator } from "@ngneat/spectator/vitest";
import { BehaviorSubject, EMPTY, of, Subject, throwError } from "rxjs";
import { MatIconRegistry } from "@angular/material/icon";
import { FakeMatIconRegistry } from "@angular/material/icon/testing";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { ImportComponent } from "./import.component";
import {
  DatasetInfo,
  ExchangeService,
  ImportLogInfo,
  ImportTypeInfo,
} from "../exchange.service";
import { DocumentService } from "../../services/document/document.service";
import { RxStompService } from "../../rx-stomp.service";
import { ConfigService } from "../../services/config/config.service";
import { getTranslocoModule } from "../../transloco-testing.module";

describe("ImportComponent", () => {
  let spectator: Spectator<ImportComponent>;
  let lastLog$: Subject<any>;
  let stompWatch$: Subject<any>;
  let connected$: BehaviorSubject<boolean>;
  let documentServiceMock: {
    uuidExists: ReturnType<typeof vi.fn>;
    getPath: ReturnType<typeof vi.fn>;
  };
  let exchangeServiceMock: {
    lastLog$: Subject<any>;
    fetchLastLog: ReturnType<typeof vi.fn>;
    getImportTypes: ReturnType<typeof vi.fn>;
    import: ReturnType<typeof vi.fn>;
    stopJob: ReturnType<typeof vi.fn>;
  };
  let routerMock: {
    navigate: ReturnType<typeof vi.fn>;
  };

  const createComponent = createComponentFactory({
    component: ImportComponent,
    imports: [getTranslocoModule()],
    providers: [
      { provide: MatIconRegistry, useClass: FakeMatIconRegistry },
      {
        provide: ExchangeService,
        useFactory: () => {
          lastLog$ = new Subject<any>();
          exchangeServiceMock = {
            lastLog$,
            fetchLastLog: vi.fn(),
            getImportTypes: vi.fn().mockReturnValue(of([] as ImportTypeInfo[])),
            import: vi.fn().mockReturnValue(of({})),
            stopJob: vi.fn(),
          };
          return exchangeServiceMock;
        },
      },
      {
        provide: DocumentService,
        useFactory: () => {
          documentServiceMock = {
            uuidExists: vi.fn().mockReturnValue(of(true)),
            getPath: vi.fn().mockReturnValue(of([])),
          };
          return documentServiceMock;
        },
      },
      {
        provide: RxStompService,
        useFactory: () => {
          connected$ = new BehaviorSubject<boolean>(true);
          stompWatch$ = new Subject<any>();
          return {
            connected$,
            watch: vi.fn().mockReturnValue(stompWatch$),
          };
        },
      },
      {
        provide: Router,
        useFactory: () => {
          routerMock = {
            navigate: vi.fn(),
          };
          return routerMock;
        },
      },
      {
        provide: MatDialog,
        useValue: {
          open: vi.fn().mockReturnValue({ afterClosed: () => EMPTY }),
        },
      },
      {
        provide: ConfigService,
        useValue: {
          hasWriteRootPermission: vi.fn().mockReturnValue(true),
        },
      },
    ],
  });

  beforeEach(() => {
    spectator = createComponent();
    spectator.detectChanges();
  });

  it("should create component with empty datasets with no permission", () => {
    expect(spectator.component).toBeTruthy();
    expect(spectator.component.datasetsWithNoPermission()).toEqual([]);
  });

  it("should check permissions reactively when navigating to step 1 with an existing report", () => {
    const existingDatasets: DatasetInfo[] = [
      { title: "Dataset 1", type: "dataset", uuid: "uuid-1" },
      { title: "Dataset 2", type: "dataset", uuid: "uuid-2" },
    ];

    spectator.component.message.set({
      stage: "ANALYZE",
      startTime: "2026-01-01",
      endTime: "2026-01-01",
      errors: [],
      infos: [],
      report: {
        importers: ["test"],
        references: [],
        numDatasets: 2,
        numAddresses: 0,
        existingDatasets,
        existingAddresses: [],
        importResult: {
          documents: 0,
          addresses: 0,
          overwritten: 0,
          skipped: 0,
        },
      },
    } as unknown as ImportLogInfo);

    documentServiceMock.uuidExists.mockImplementation((uuid: string) =>
      of(uuid === "uuid-1"),
    );

    spectator.component.handleStepEvent(1);
    spectator.detectChanges();

    expect(documentServiceMock.uuidExists).toHaveBeenCalledWith("uuid-1");
    expect(documentServiceMock.uuidExists).toHaveBeenCalledWith("uuid-2");
    expect(spectator.component.datasetsWithNoPermission()).toEqual([
      existingDatasets[1],
    ]);
  });

  it("should update permissions when report arrives asynchronously while already on step 1", () => {
    spectator.component.handleStepEvent(1);
    spectator.detectChanges();

    expect(spectator.component.datasetsWithNoPermission()).toEqual([]);
    expect(documentServiceMock.uuidExists).not.toHaveBeenCalled();

    const existingDatasets: DatasetInfo[] = [
      { title: "Forbidden Dataset", type: "dataset", uuid: "forbidden-uuid" },
    ];

    documentServiceMock.uuidExists.mockReturnValue(of(false));

    spectator.component.message.set({
      stage: "ANALYZE",
      startTime: "2026-01-01",
      endTime: "2026-01-01",
      errors: [],
      infos: [],
      report: {
        importers: [],
        references: [],
        numDatasets: 1,
        numAddresses: 0,
        existingDatasets,
        existingAddresses: [],
        importResult: {
          documents: 0,
          addresses: 0,
          overwritten: 0,
          skipped: 0,
        },
      },
    } as unknown as ImportLogInfo);
    spectator.detectChanges();

    expect(documentServiceMock.uuidExists).toHaveBeenCalledWith(
      "forbidden-uuid",
    );
    expect(spectator.component.datasetsWithNoPermission()).toEqual(
      existingDatasets,
    );
  });

  it("should treat uuidExists error as no permission safely", () => {
    const existingDatasets: DatasetInfo[] = [
      { title: "Error Dataset", type: "dataset", uuid: "error-uuid" },
    ];

    documentServiceMock.uuidExists.mockReturnValue(
      throwError(() => new Error("Network error")),
    );

    spectator.component.message.set({
      stage: "ANALYZE",
      startTime: "2026-01-01",
      endTime: "2026-01-01",
      errors: [],
      infos: [],
      report: {
        importers: [],
        references: [],
        numDatasets: 1,
        numAddresses: 0,
        existingDatasets,
        existingAddresses: [],
        importResult: {
          documents: 0,
          addresses: 0,
          overwritten: 0,
          skipped: 0,
        },
      },
    } as unknown as ImportLogInfo);

    spectator.component.handleStepEvent(1);
    spectator.detectChanges();

    expect(spectator.component.datasetsWithNoPermission()).toEqual(
      existingDatasets,
    );
  });

  it("should reset forbidden datasets when leaving step 1", () => {
    const existingDatasets: DatasetInfo[] = [
      { title: "Dataset", type: "dataset", uuid: "uuid-1" },
    ];
    documentServiceMock.uuidExists.mockReturnValue(of(false));

    spectator.component.message.set({
      stage: "ANALYZE",
      startTime: "2026-01-01",
      endTime: "2026-01-01",
      errors: [],
      infos: [],
      report: {
        importers: [],
        references: [],
        numDatasets: 1,
        numAddresses: 0,
        existingDatasets,
        existingAddresses: [],
        importResult: {
          documents: 0,
          addresses: 0,
          overwritten: 0,
          skipped: 0,
        },
      },
    } as unknown as ImportLogInfo);

    spectator.component.handleStepEvent(1);
    spectator.detectChanges();
    expect(spectator.component.datasetsWithNoPermission().length).toBe(1);

    spectator.component.handleStepEvent(0);
    spectator.detectChanges();
    expect(spectator.component.datasetsWithNoPermission()).toEqual([]);
  });

  it("should safely handle reports with empty or missing existingDatasets", () => {
    spectator.component.message.set({
      stage: "ANALYZE",
      startTime: "2026-01-01",
      endTime: "2026-01-01",
      errors: [],
      infos: [],
      report: {
        importers: [],
        references: [],
        numDatasets: 0,
        numAddresses: 0,
        existingDatasets: [],
        existingAddresses: [],
        importResult: {
          documents: 0,
          addresses: 0,
          overwritten: 0,
          skipped: 0,
        },
      },
    } as unknown as ImportLogInfo);

    spectator.component.handleStepEvent(1);
    spectator.detectChanges();

    expect(spectator.component.datasetsWithNoPermission()).toEqual([]);
  });

  it("should navigate to imported document when references exist", () => {
    spectator.component.message.set({
      stage: "IMPORT",
      startTime: "2026-01-01",
      endTime: "2026-01-01",
      errors: [],
      infos: [],
      report: {
        importers: [],
        references: [
          {
            isAddress: true,
            document: { _uuid: "addr-uuid" },
            wrapperId: 1,
            exists: true,
            references: [],
          },
          {
            isAddress: false,
            document: { _uuid: "doc-uuid" },
            wrapperId: 2,
            exists: false,
            references: [],
          },
        ],
        numDatasets: 1,
        numAddresses: 1,
        existingDatasets: [],
        existingAddresses: [],
        importResult: {
          documents: 1,
          addresses: 1,
          overwritten: 0,
          skipped: 0,
        },
      },
    } as unknown as ImportLogInfo);

    spectator.component.openImportedDocument();

    expect(routerMock.navigate).toHaveBeenCalledWith([
      `${ConfigService.catalogId}/form`,
      { id: "doc-uuid" },
    ]);
  });
});
