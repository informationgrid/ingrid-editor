/**
 * ==================================================
 * Copyright (C) 2024-2025 wemove digital solutions GmbH
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
import { createComponentFactory, Spectator } from "@ngneat/spectator";
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
import { ThesaurusType } from "../../../components/thesaurus-result";
import { KeywordAnalysis } from "../../../utils/keywords";
import { CodelistStore } from "../../../../../app/store/codelist/codelist.store";
import { CodelistEntry } from "../../../../../app/store/codelist/codelist.model";
import { MatIconTestingModule } from "@angular/material/icon/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { waitSomeTime } from "../../../utils/time";

describe("ConsolidateDialogComponent", () => {
  let spectator: Spectator<ConsolidateDialogComponent>;
  const createComponent = createComponentFactory({
    component: ConsolidateDialogComponent,
    imports: [MatIconTestingModule],
    providers: [
      provideZonelessChangeDetection(),
      { provide: MAT_DIALOG_DATA, useValue: [] },
      { provide: MatDialogRef, useValue: [] },
      provideHttpClient(withInterceptorsFromDi()),
      provideHttpClientTesting(),
    ],
  });

  beforeAll(() => {
    ConfigService.backendApiUrl = "/api/";
  });

  beforeEach(() => {
    spectator = createComponent({ detectChanges: false });
  });

  it("should show an empty result when no keywords available", async () => {
    initForm({ free: [], gemet: [], umthes: [] });

    await spectator.fixture.whenStable();
    expect(spectator.query("ige-dialog-template")).toHaveText(
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
    await waitSomeTime();
    expectKeywordCount("INSPIRE-Themen", 1, "Adressen", "added");
    expectKeywordCount("Freie Schlagworte", 1, "Adressen", "removed");
    expectThesaurusNotExists("Umthes-Schlagworte");
    expectThesaurusNotExists("Gemet-Schlagworte");
  });

  it("should move a gemet keyword to inspire", async () => {
    initForm({ gemet: [{ label: "Adressen" }] }, [], "conform");

    mockCheckInThemes({ description: "", id: "1", fields: { de: "Adressen" } });
    await waitSomeTime();
    expectKeywordCount("INSPIRE-Themen", 1, "Adressen", "added");
    expectKeywordCount("Gemet-Schlagworte", 1, "Adressen", "removed");
    expectThesaurusNotExists("Umthes-Schlagworte");
    expectThesaurusNotExists("Freie Schlagworte");
  });

  it("should move a gemet keyword to free keywords if not found", async () => {
    initForm({ gemet: [{ id: 1, label: "test" }] });

    await mockHttp({});
    await waitSomeTime();
    expectKeywordCount("Freie Schlagworte", 1, "test", "added");
    expectKeywordCount("Gemet-Schlagworte", 1, "test", "removed");
    expectThesaurusNotExists("Umthes-Schlagworte");
  });

  it("should move an umthes keyword to free keywords if not found", async () => {
    initForm({ umthes: [{ id: 1, label: "test" }] });

    await mockHttp({});
    await waitSomeTime();
    expectKeywordCount("Freie Schlagworte", 1, "test", "added");
    expectKeywordCount("Umthes-Schlagworte", 1, "test", "removed");
    expectThesaurusNotExists("Gemet-Schlagworte");
  });

  it("should move an umthes keyword to gemet keywords (higher hierarchy)", async () => {
    initForm({ umthes: [{ id: 1, label: "test" }] });

    await mockHttp({ gemet: [{ id: "1", label: "test" }] });
    await waitSomeTime();
    expectKeywordCount("Gemet-Schlagworte", 1, "test", "added");
    expectKeywordCount("Umthes-Schlagworte", 1, "test", "removed");
    expectThesaurusNotExists("Freie Schlagworte");
    expectThesaurusNotExists("INSPIRE-Themen");
  });

  it("should move an umthes keyword to inspire", async () => {
    initForm({ umthes: [{ id: 1, label: "Adressen" }] }, [], "conform");

    mockCheckInThemes({ description: "", id: "1", fields: { de: "Adressen" } });
    await waitSomeTime();
    expectKeywordCount("INSPIRE-Themen", 1, "Adressen", "added");
    expectKeywordCount("Umthes-Schlagworte", 1, "Adressen", "removed");
    expectThesaurusNotExists("Freie Schlagworte");
    expectThesaurusNotExists("Gemet-Schlagworte");
  });

  it("should notify if thesauri are not available", async () => {
    initForm({ free: [{ label: "test" }] });

    const keywordAnalysis = spectator.inject(KeywordAnalysis);
    spyOn(keywordAnalysis, "analyzeKeywords").and.returnValue(
      new Promise((resolve) => {
        // @ts-ignore: force an error in the component
        resolve("Some error message.");
      }),
    );
    await waitSomeTime();
    expect(spectator.query("div.legend")).not.toContainText(
      "Die Schlagworte werden analysiert. Bitte warten Sie einen Moment.",
    );
    expect(spectator.query(".error-message")).toExist();
    expect(spectator.query(".error-message")).toContainText(
      "Es konnte keine Verbindung zu einem der Thesauri hergestellt werden.",
    );

    expectThesaurusNotExists("INSPIRE-Themen");
    expectThesaurusNotExists("Freie Schlagworte");
    expectThesaurusNotExists("Gemet-Schlagworte");
    expectThesaurusNotExists("Umthes-Schlagworte");
  });

  function expectKeywordCount(
    thesaurus: ThesaurusType,
    count: number,
    value?: string,
    state?: "removed" | "added" | "unchanged",
  ) {
    expect(
      spectator.query(`div[aria-label='${thesaurus}'] mat-chip`),
    ).toHaveLength(count);
    if (value) {
      expect(
        spectator.query(`div[aria-label='${thesaurus}'] mat-chip`),
      ).toHaveText(value);
    }
    if (state) {
      expect(
        spectator.query(`div[aria-label='${thesaurus}'] mat-chip`),
      ).toHaveClass(state + "-keyword");
    }
  }

  function expectThesaurusNotExists(thesaurus: ThesaurusType) {
    expect(spectator.query(`div[aria-label='${thesaurus}']`)).not.toExist();
  }

  function initForm(
    keywords: Keywords,
    themes: { key: string }[] = [],
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
  }

  async function mockHttp(data?: {
    gemet?: { id: string; label: string }[];
    umthes?: { id: string; label: string }[];
  }) {
    const httpCtrl = spectator.inject(HttpTestingController);

    await spectator.fixture.whenStable();
    const reqGemet = httpCtrl.expectOne(
      "/api/keywords/gemet?q=test&type=EXACT",
    );
    reqGemet.flush(data?.gemet ?? []);

    if (data?.gemet && !data?.umthes) {
      // If gemet was found, we don't need to check umthes.
      httpCtrl.expectNone("/api/keywords/umthes?q=test&type=EXACT");
      httpCtrl.verify();
      return;
    }

    await waitSomeTime();
    const reqUmthes = httpCtrl.expectOne(
      "/api/keywords/umthes?q=test&type=EXACT",
    );
    reqUmthes.flush(data?.umthes ?? []);

    // Finally, assert that there are no outstanding requests.
    httpCtrl.verify();
  }

  function mockCheckInThemes(data?: CodelistEntry) {
    const codelistStore = spectator.inject(CodelistStore);
    spyOn(codelistStore, "getCodelistEntryByValue").and.returnValue(data);
  }
});
