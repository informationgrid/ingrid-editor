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
import { CodelistPipe } from "./codelist.pipe";
import { CodelistStore } from "../store/codelist/codelist.store";
import { GeneralStore } from "../store/general.store";
import { CodelistService } from "../services/codelist/codelist.service";
import { CodelistDataService } from "../services/codelist/codelist-data.service";
import { ConfigService } from "../services/config/config.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TestBed } from "@angular/core/testing";
import { BehaviorSubject, firstValueFrom } from "rxjs";
import { BackendOption } from "../store/codelist/codelist.model";

describe("CodelistPipe", () => {
  let pipe: CodelistPipe;
  let codelistService: CodelistService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CodelistPipe,
        CodelistStore,
        GeneralStore,
        CodelistService,
        CodelistDataService,
        { provide: ConfigService, useValue: { getConfiguration: () => ({}) } },
        { provide: MatSnackBar, useValue: {} },
      ],
    });
    pipe = TestBed.inject(CodelistPipe);
    codelistService = TestBed.inject(CodelistService);

    // vitest spies call through to the original implementation by default
    vi.spyOn(codelistService, "byId");
  });

  function addServiceVersionCodelist() {
    TestBed.inject(CodelistStore).addCodelists([
      {
        id: "5152",
        name: "Service Version",
        description: null,
        entries: [
          {
            id: "1",
            description: null,
            fields: { de: "WMS 1.3.0" },
            data: null,
          },
        ],
        default: null,
        isCatalog: false,
      },
    ]);
  }

  it("should resolve a BehaviorSubject codelist id to its current value", async () => {
    addServiceVersionCodelist();

    const result = await firstValueFrom(
      pipe.transform(
        { key: "1", value: "WMS 1.3.0" } as BackendOption,
        new BehaviorSubject<string>("5152"),
      ),
    );

    expect(result).toBe("WMS 1.3.0");
    expect(codelistService.byId).not.toHaveBeenCalled();
  });

  it("should work with plain string codelist ids", async () => {
    addServiceVersionCodelist();

    const result = await firstValueFrom(
      pipe.transform({ key: "1", value: "WMS 1.3.0" } as BackendOption, "5152"),
    );

    expect(result).toBe("WMS 1.3.0");
    expect(codelistService.byId).not.toHaveBeenCalled();
  });

  it("should request the codelist by the BehaviorSubject value when it is not in the store", async () => {
    const subject = new BehaviorSubject<string>("5152");

    // the pipe waits for the codelist to be added to the store
    const resultPromise = firstValueFrom(
      pipe.transform(
        { key: "1", value: "WMS 1.3.0" } as BackendOption,
        subject,
      ),
    );

    // the pipe requested the resolved id, not '[object Object]'
    expect(codelistService.byId).toHaveBeenCalledWith("5152");

    // simulate the delayed response of the codelist request
    addServiceVersionCodelist();

    const result = await resultPromise;
    expect(result).toBe("WMS 1.3.0");
  });
});
