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
import {
  createComponentFactory,
  mockProvider,
  Spectator,
} from "@ngneat/spectator/vitest";
import {
  ConsolidateDialogComponent,
  Keyword,
  Keywords,
} from "./consolidate-dialog.component";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { FormStateService } from "../../../../../app/+form/form-state.service";
import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { ConfigService } from "../../../../../app/services/config/config.service";
import {
  FREE_THESAURUS,
  KeywordAnalysis,
  Thesaurus,
} from "../../../utils/keywords";
import { ProfileService } from "../../../../../app/services/profile.service";
import { CodelistStore } from "../../../../../app/store/codelist/codelist.store";
import { CodelistEntry } from "../../../../../app/store/codelist/codelist.model";
import { MatIconTestingModule } from "@angular/material/icon/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { waitSomeTime } from "../../../utils/time";
import { vi } from "vitest";
import { MatSnackBar } from "@angular/material/snack-bar";
import { GeneralStore } from "../../../../../app/store/general.store";
import { CommonFieldsBaw } from "../../../../../profiles/ingrid-baw/doctypes/common-fields";

const mockKeywordThesauri: Thesaurus[] = [
  {
    id: "gemet",
    label: "Gemet-Schlagworte",
    modelPath: "keywords.gemet",
    type: "external",
  },
  {
    id: "umthes",
    label: "Umthes-Schlagworte",
    modelPath: "keywords.umthes",
    type: "external",
  },
  {
    id: "inspireTopics",
    label: "INSPIRE-Themen",
    modelPath: "themes",
    type: "codelist",
    codelistId: "6100",
    isEnabled: (form) => form.value?.properties?.isInspireIdentified,
  },
  CommonFieldsBaw.BawKeywordThesaurus,
  FREE_THESAURUS,
];

const mockDoctype = { keywordThesauri: mockKeywordThesauri };

describe("ConsolidateDialogComponent", () => {
  let spectator: Spectator<ConsolidateDialogComponent>;
  const createComponent = createComponentFactory({
    component: ConsolidateDialogComponent,
    imports: [MatIconTestingModule],
    providers: [
      provideZonelessChangeDetection(),
      { provide: MAT_DIALOG_DATA, useValue: [] },
      { provide: MatDialogRef, useValue: [] },
      {
        provide: ProfileService,
        useValue: {
          getDoctype: () => mockDoctype,
        },
      },
      mockProvider(GeneralStore, {
        getOpenedDocument: () => ({ _type: "InGridGeoService" }),
      }),
      FormStateService,
      KeywordAnalysis,
      {
        provide: CodelistStore,
        useValue: { getCodelistEntryByValue: () => {} },
      },
      { provide: MatSnackBar, useValue: { open: () => {} } },
      provideHttpClient(withInterceptorsFromDi()),
      provideHttpClientTesting(),
    ],
  });

  beforeAll(() => {
    ConfigService.backendApiUrl = "/api/";
  });

  beforeEach(() => {
    window.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    spectator = createComponent({ detectChanges: false });
  });

  it("should show an empty result when no keywords available", async () => {
    initForm({ free: [], gemet: [], umthes: [] });

    await spectator.fixture.whenStable();
    spectator.detectChanges();
    expect(spectator.query("ige-dialog-template").textContent).contains(
      "In diesem Datensatz sind keine Schlagworte vorhanden.",
    );
    expectThesaurusNotExists("Umthes-Schlagworte");
    expectThesaurusNotExists("Gemet-Schlagworte");
    expectThesaurusNotExists("Freie Schlagworte");
  });

  it("should not re-assign free keywords", async () => {
    initForm({ free: [{ label: "test" }] });
    await mockHttp();
    await waitSomeTime();
    expectKeywordCount("Freie Schlagworte", 1, "test", "unchanged");
    expectThesaurusNotExists("Umthes-Schlagworte");
    expectThesaurusNotExists("Gemet-Schlagworte");
  });

  it("should move a free keyword to umthes", async () => {
    initForm({ free: [{ label: "test" }] });

    await mockHttp({ umthes: [{ id: "1", label: "test" }] });
    await waitSomeTime();
    expectKeywordCount("Freie Schlagworte", 1, "test", "removed");
    expectKeywordCount("Umthes-Schlagworte", 1, "test", "added");
    expectThesaurusNotExists("Gemet-Schlagworte");
  });

  it("should move a free keyword to gemet", async () => {
    initForm({ free: [{ label: "test" }] });
    await mockHttp({ gemet: [{ id: "1", label: "test" }] });

    await waitSomeTime();
    expectKeywordCount("Freie Schlagworte", 1, "test", "removed");
    expectKeywordCount("Gemet-Schlagworte", 1, "test", "added");
    expectThesaurusNotExists("Umthes-Schlagworte");
  });

  it("should move a free keyword to the BAW thesaurus", async () => {
    initForm({ free: [{ label: "Schlagwort1" }], bawKeywords: [] });

    mockCheckInCodelist({
      description: "",
      id: "Schlagwort1",
      fields: { de: "Schlagwort1" },
    });
    await mockHttp({});
    await waitSomeTime();

    expectKeywordCount("Freie Schlagworte", 1, "Schlagwort1", "removed");
    expectKeywordCount("BAW-Schlagworte", 1, "Schlagwort1", "added");
    expectThesaurusNotExists("Gemet-Schlagworte");
    expectThesaurusNotExists("Umthes-Schlagworte");
  });

  it("should keep a free keyword and add synonym to gemet", async () => {
    initForm({ free: [{ label: "test" }] });
    await mockHttp({ gemet: [{ id: "1", label: "test-other" }] });
    await waitSomeTime();
    expectKeywordCount("Freie Schlagworte", 1, "test", "unchanged");
    expectKeywordCount("Gemet-Schlagworte", 1, "test-other", "added");
    expectThesaurusNotExists("Umthes-Schlagworte");
  });

  it("should keep a free keyword and add synonym to umthes", async () => {
    initForm({ free: [{ label: "test" }] });
    await mockHttp({ umthes: [{ id: "1", label: "test-other" }] });
    await waitSomeTime();
    expectKeywordCount("Freie Schlagworte", 1, "test", "unchanged");
    expectKeywordCount("Umthes-Schlagworte", 1, "test-other", "added");
    expectThesaurusNotExists("Gemet-Schlagworte");
  });

  it("should move a free keyword to inspire", async () => {
    initForm({ free: [{ label: "Adressen" }] }, [], "conform");

    mockCheckInThemes({ description: "", id: "1", fields: { de: "Adressen" } });
    await mockHttp({});
    await waitSomeTime();
    expectKeywordCount("INSPIRE-Themen", 1, "Adressen", "added");
    expectKeywordCount("Freie Schlagworte", 1, "Adressen", "removed");
    expectThesaurusNotExists("Umthes-Schlagworte");
    expectThesaurusNotExists("Gemet-Schlagworte");
  });

  it("should move a gemet keyword to inspire", async () => {
    initForm({ gemet: [{ label: "Adressen" }] }, [], "conform");

    mockCheckInThemes({ description: "", id: "1", fields: { de: "Adressen" } });
    await mockHttp({});
    await waitSomeTime();
    expectKeywordCount("INSPIRE-Themen", 1, "Adressen", "added");
    expectKeywordCount("Gemet-Schlagworte", 1, "Adressen", "removed");
    expectThesaurusNotExists("Umthes-Schlagworte");
    expectThesaurusNotExists("Freie Schlagworte");
  });

  it("should move a gemet keyword to free keywords if not found", async () => {
    initForm({ gemet: [{ id: "1", label: "test" }] });

    await mockHttp({});
    await waitSomeTime();
    expectKeywordCount("Freie Schlagworte", 1, "test", "added");
    expectKeywordCount("Gemet-Schlagworte", 1, "test", "removed");
    expectThesaurusNotExists("Umthes-Schlagworte");
  });

  it("should move an umthes keyword to free keywords if not found", async () => {
    initForm({ umthes: [{ id: "1", label: "test" }] });

    await mockHttp({});
    await waitSomeTime();
    expectKeywordCount("Freie Schlagworte", 1, "test", "added");
    expectKeywordCount("Umthes-Schlagworte", 1, "test", "removed");
    expectThesaurusNotExists("Gemet-Schlagworte");
  });

  it("should move an umthes keyword to gemet keywords (higher hierarchy)", async () => {
    initForm({ umthes: [{ id: "1", label: "test" }] });

    await mockHttp({ gemet: [{ id: "1", label: "test" }] });
    await waitSomeTime();
    expectKeywordCount("Gemet-Schlagworte", 1, "test", "added");
    expectKeywordCount("Umthes-Schlagworte", 1, "test", "removed");
    expectThesaurusNotExists("Freie Schlagworte");
    expectThesaurusNotExists("INSPIRE-Themen");
  });

  it("should move an umthes keyword to inspire", async () => {
    initForm({ umthes: [{ id: "1", label: "Adressen" }] }, [], "conform");

    mockCheckInThemes({ description: "", id: "1", fields: { de: "Adressen" } });
    await mockHttp({});
    await waitSomeTime();
    expectKeywordCount("INSPIRE-Themen", 1, "Adressen", "added");
    expectKeywordCount("Umthes-Schlagworte", 1, "Adressen", "removed");
    expectThesaurusNotExists("Freie Schlagworte");
    expectThesaurusNotExists("Gemet-Schlagworte");
  });

  it("should notify if thesauri are not available", async () => {
    const keywordAnalysis = spectator.inject(KeywordAnalysis);
    vi.spyOn(keywordAnalysis, "analyzeKeywords").mockReturnValue(
      // @ts-ignore
      new Promise((resolve: any) => {
        // @ts-ignore: force an error in the component
        resolve("Some error message.");
      }),
    );
    initForm({ free: [{ label: "test" }] });
    await waitSomeTime();
    expect(spectator.query("div.legend")).toBe(null);
    // .textContent).not.contains(
    //   "Die Schlagworte werden analysiert. Bitte warten Sie einen Moment.",
    // );
    expect(spectator.query(".error-message")).not.toBe(null);
    expect(spectator.query(".error-message").textContent).contains(
      "Es konnte keine Verbindung zu einem der Thesauri hergestellt werden.",
    );

    expectThesaurusNotExists("INSPIRE-Themen");
    expectThesaurusNotExists("Freie Schlagworte");
    expectThesaurusNotExists("Gemet-Schlagworte");
    expectThesaurusNotExists("Umthes-Schlagworte");
  });

  function expectKeywordCount(
    thesaurus: string,
    count: number,
    value?: string,
    state?: "removed" | "added" | "unchanged",
  ) {
    expect(
      spectator.query(`div[aria-label='${thesaurus}'] mat-chip`),
    ).toHaveLength(count);
    if (value) {
      expect(
        spectator
          .query(`div[aria-label='${thesaurus}'] mat-chip`)
          .textContent.trim(),
      ).toEqual(value);
    }
    if (state) {
      expect(
        spectator
          .query(`div[aria-label='${thesaurus}'] mat-chip`)
          .classList.contains(state + "-keyword"),
      ).toBe(true);
    }
  }

  function expectThesaurusNotExists(thesaurus: string) {
    expect(spectator.query(`div[aria-label='${thesaurus}']`)).toBe(null);
  }

  function initForm(
    keywords: Keywords & { bawKeywords?: Keyword[] },
    themes: {
      key: string;
    }[] = [],
    isInspireIdentified: any = false,
  ) {
    const formStateService = spectator.inject(FormStateService, true);
    const form = new FormGroup({
      keywords: new FormGroup({
        gemet: new FormArray([]),
        umthes: new FormArray([]),
        free: new FormArray([]),
      }),
      properties: new FormGroup({
        isInspireIdentified: new FormControl(isInspireIdentified),
      }),
      themes: new FormArray([]),
    });
    if (keywords.bawKeywords) {
      (form.get("keywords") as FormGroup).addControl(
        "bawKeywords",
        new FormArray([]),
      );
    }
    if (keywords.free?.length > 0) {
      keywords.free.forEach((keyword: Keyword) => {
        form.controls.keywords.controls.free.push(
          new FormControl({ label: keyword.label }),
        );
      });
    }
    if (keywords.gemet?.length > 0) {
      keywords.gemet.forEach((keyword: Keyword) => {
        form.controls.keywords.controls.gemet.push(
          new FormControl({ id: keyword.id, label: keyword.label }),
        );
      });
    }
    if (keywords.umthes?.length > 0) {
      keywords.umthes.forEach((keyword: Keyword) => {
        form.controls.keywords.controls.umthes.push(
          new FormControl({ id: keyword.id, label: keyword.label }),
        );
      });
    }
    if (keywords.bawKeywords?.length > 0) {
      keywords.bawKeywords.forEach((keyword: Keyword) => {
        (form.get("keywords.bawKeywords") as unknown as FormArray).push(
          new FormControl({
            key: keyword.id,
            value: keyword.label,
            _codelistId: "3950005",
          }),
        );
      });
    }
    if (themes.length > 0) {
      themes.forEach((theme) => {
        form.controls.themes.push(new FormControl({ key: theme.key }));
      });
    }
    formStateService.updateForm(form);
    formStateService.updateMetadata({
      docType: "InGridGeoService",
      parentId: null,
    });
    spectator.detectChanges();
  }

  async function mockHttp(data?: {
    gemet?: {
      id: string;
      label: string;
    }[];
    umthes?: {
      id: string;
      label: string;
    }[];
  }) {
    const httpCtrl = spectator.inject(HttpTestingController);

    await spectator.fixture.whenStable();
    spectator.detectChanges();

    const reqGemet = httpCtrl.expectOne((req) =>
      req.url.includes("keywords/gemet"),
    );
    reqGemet.flush(data?.gemet ?? []);

    if (data?.gemet && !data?.umthes) {
      // If gemet was found, we don't need to check umthes.
      httpCtrl.expectNone((req) => req.url.includes("keywords/umthes"));
      httpCtrl.verify();
      return;
    }

    await waitSomeTime();
    const reqUmthes = httpCtrl.expectOne((req) =>
      req.url.includes("keywords/umthes"),
    );
    reqUmthes.flush(data?.umthes ?? []);

    // Finally, assert that there are no outstanding requests.
    await spectator.fixture.whenStable();
    spectator.detectChanges();
    httpCtrl.verify();
  }

  function mockCheckInThemes(data?: CodelistEntry) {
    const codelistStore = spectator.inject(CodelistStore);
    vi.spyOn(codelistStore, "getCodelistEntryByValue").mockReturnValue(data);
  }

  function mockCheckInCodelist(data?: CodelistEntry) {
    const codelistStore = spectator.inject(CodelistStore);
    vi.spyOn(codelistStore, "getCodelistEntryByValue").mockReturnValue(data);
  }
});
