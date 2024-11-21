import { createComponentFactory, Spectator } from "@ngneat/spectator";
import { ConsolidateDialogComponent } from "./consolidate-dialog.component";
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
import { fakeAsync, tick } from "@angular/core/testing";
import { ThesaurusType } from "../../../components/thesaurus-result";

describe("ConsolidateDialogComponent", () => {
  let spectator: Spectator<ConsolidateDialogComponent>;
  const createComponent = createComponentFactory({
    component: ConsolidateDialogComponent,
    providers: [
      { provide: MAT_DIALOG_DATA, useValue: [] },
      { provide: MatDialogRef, useValue: [] },
      provideHttpClient(withInterceptorsFromDi()),
      provideHttpClientTesting(),
    ],
  });

  beforeAll(() => {
    ConfigService.backendApiUrl = "/api/";
  });

  beforeEach(() => (spectator = createComponent({ detectChanges: false })));

  it("should show an empty result when no keywords available", () => {
    initForm();
    spectator.detectChanges();

    expect(spectator.query("ige-dialog-template")).toHaveText(
      "In diesem Datensatz sind keine Schlagworte vorhanden.",
    );
    expectThesaurusNotExists("Umthes-Schlagworte");
    expectThesaurusNotExists("Gemet-Schlagworte");
    expectThesaurusNotExists("Freie Schlagworte");
  });

  it("should not re-assign free keywords", fakeAsync(() => {
    initForm(["test"]);
    spectator.detectChanges();
    mockHttp();

    expectKeywordCount("Freie Schlagworte", 1, "test", "unchanged");
    expectThesaurusNotExists("Umthes-Schlagworte");
    expectThesaurusNotExists("Gemet-Schlagworte");
  }));

  it("should move a free keyword to umthes", fakeAsync(() => {
    initForm(["test"]);
    spectator.detectChanges();
    mockHttp({ umthes: [{ id: "1", label: "test" }] });

    expectKeywordCount("Freie Schlagworte", 1, "test", "removed");
    expectKeywordCount("Umthes-Schlagworte", 1, "test", "added");
    expectThesaurusNotExists("Gemet-Schlagworte");
  }));

  it("should keep a free keyword and add synonym to umthes", fakeAsync(() => {
    initForm(["test"]);
    spectator.detectChanges();
    mockHttp({ umthes: [{ id: "1", label: "test-other" }] });

    expectKeywordCount("Freie Schlagworte", 1, "test", "unchanged");
    expectKeywordCount("Umthes-Schlagworte", 1, "test-other", "added");
    expectThesaurusNotExists("Gemet-Schlagworte");
  }));

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

  function initForm(free: string[] = []) {
    const formStateService = spectator.inject(FormStateService, true);
    const form = new FormGroup({
      keywords: new FormGroup({
        free: new FormArray([]),
      }),
    });
    if (free.length > 0) {
      form.controls.keywords.controls.free.push(
        new FormGroup({
          label: new FormControl(free[0]),
        }),
      );
    }
    formStateService.updateForm(form);
    formStateService.updateMetadata({});
  }

  function mockHttp(data?: {
    gemet?: {};
    umthes?: { id: string; label: string }[];
  }) {
    const httpCtrl = spectator.inject(HttpTestingController);
    const reqGemet = httpCtrl.expectOne(
      "/api/keywords/gemet?q=test&type=EXACT",
    );
    reqGemet.flush(data?.gemet ?? []);
    tick();
    const reqUmthes = httpCtrl.expectOne(
      "/api/keywords/umthes?q=test&type=EXACT",
    );
    reqUmthes.flush(data?.umthes ?? []);
    tick();
    // Finally, assert that there are no outstanding requests.
    httpCtrl.verify();

    spectator.detectChanges();
  }
});
