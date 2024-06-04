/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { ConformityDialogComponent } from "./conformity-dialog.component";
import {
  createComponentFactory,
  mockProvider,
  Spectator,
} from "@ngneat/spectator";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatFormFieldModule } from "@angular/material/form-field";
import { DialogTemplateModule } from "../../../app/shared/dialog-template/dialog-template.module";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatIconTestingModule } from "@angular/material/icon/testing";
import { MatSelectModule } from "@angular/material/select";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatAutocompleteHarness } from "@angular/material/autocomplete/testing";
import {
  DateAdapter,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
} from "@angular/material/core";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { MatCheckboxHarness } from "@angular/material/checkbox/testing";
import { CodelistQuery } from "../../../app/store/codelist/codelist.query";
import { CodelistEntry } from "../../../app/store/codelist/codelist.model";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  CodelistService,
  SelectOptionUi,
} from "../../../app/services/codelist/codelist.service";
import { Observable, of } from "rxjs";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatDatepickerInputHarness } from "@angular/material/datepicker/testing";
import { MatInputHarness } from "@angular/material/input/testing";
import { MatSelectHarness } from "@angular/material/select/testing";
import { UntilDestroy } from "@ngneat/until-destroy";
import { GermanDateAdapter } from "../../../app/services/german-date.adapter";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";

describe("ConformityDialogComponent", () => {
  let spectator: Spectator<ConformityDialogComponent>;
  let isInspireCheckbox: MatCheckboxHarness;
  let dateField: MatDatepickerInputHarness;
  let descriptionField: MatInputHarness;
  let inspireSpecification: MatSelectHarness;
  let passField: MatSelectHarness;
  let loader: any;
  let inspireSpecificationAutocomplete: MatAutocompleteHarness;
  let mockMatDialogRef: Partial<MatDialogRef<any>> = {
    close: () => {},
  };

  const createComponent = createComponentFactory({
    component: ConformityDialogComponent,
    imports: [
      MatDialogModule,
      MatSnackBarModule,
      MatFormFieldModule,
      DialogTemplateModule,
      MatInputModule,
      MatButtonModule,
      MatCheckboxModule,
      MatIconTestingModule,
      MatSelectModule,
      MatDatepickerModule,
      MatNativeDateModule,
      FormsModule,
      ReactiveFormsModule,
      MatAutocompleteModule,
    ],
    providers: [
      provideHttpClient(withInterceptorsFromDi()),
      provideHttpClientTesting(),
      { provide: MatDialogRef, useValue: mockMatDialogRef },
      { provide: MAT_DIALOG_DATA, useValue: [] },
      {
        provide: MAT_DATE_LOCALE,
        useValue: "de-DE",
      },
      {
        provide: DateAdapter,
        useClass: GermanDateAdapter,
      },
      // we need to mock CodelistService as a provider since it's already used in the constructor
      mockProvider(CodelistService, {
        observe(codelistId: string): Observable<SelectOptionUi[]> {
          if (codelistId === "6005")
            return of(<SelectOptionUi[]>[
              { label: "Eins", value: "1" },
              { label: "Zwei", value: "2" },
              { label: "Drei", value: "3" },
            ]);
          else if (codelistId === "6006")
            return of(<SelectOptionUi[]>[
              { label: "Zehn", value: "1" },
              { label: "Elf", value: "2" },
            ]);
          else if (codelistId === "6000")
            return of(<SelectOptionUi[]>[
              { label: "konform", value: "1" },
              { label: "nicht konform", value: "2" },
            ]);
        },
      }),
    ],
    componentMocks: [CodelistQuery],
    detectChanges: false,
  });

  beforeEach(async () => {
    UntilDestroy()(ConformityDialogComponent);
    spectator = createComponent();

    mockCodelists();

    loader = TestbedHarnessEnvironment.loader(spectator.fixture);
    isInspireCheckbox = await loader.getHarness(MatCheckboxHarness);
    dateField = await loader.getHarness(MatDatepickerInputHarness);
    descriptionField = await loader.getHarness(MatInputHarness);
    inspireSpecification = await loader.getHarness(
      MatSelectHarness.with({
        selector: "[data-cy='conformity-specification-id']",
      }),
    );
    passField = await loader.getHarness(
      MatSelectHarness.with({ selector: "[data-cy='conformity-level-id']" }),
    );
  });

  it("should disable the date field when isInspire is true", async () => {
    spectator.detectChanges();

    expect(await isInspireCheckbox.isChecked()).toBeTrue(); // Assuming checkbox is initially checked
    expect(await dateField.isDisabled()).toBeTrue();

    await isInspireCheckbox.uncheck();
    expect(await dateField.isDisabled()).toBeFalse();

    await isInspireCheckbox.check();
    expect(await dateField.isDisabled()).toBeTrue();
  });

  it("should set INSPIRE specification as autoComplete select value with free text ", async () => {
    await isInspireCheckbox.uncheck();
    // with uncheck the select changes to autocomplete
    inspireSpecificationAutocomplete = await loader.getHarness(
      MatAutocompleteHarness,
    );
    await inspireSpecificationAutocomplete.enterText("text to enter");
    const options = await inspireSpecificationAutocomplete.getOptions();
    expect(options.length).toBe(2);
    await passField.clickOptions({ text: "konform" });

    await dateField.setValue("18.15.2019");

    const closeDialog = spyOn(mockMatDialogRef, "close");
    spectator.component.submit();

    expect(closeDialog).toHaveBeenCalledWith({
      specification: { key: null, value: "text to enter" },
      pass: { key: "1" },
      publicationDate: new Date(
        "Wed Mar 18 2020 00:00:00 GMT+0100 (Mitteleuropäische Normalzeit)",
      ),
      explanation: null,
      isInspire: false,
    });
  });

  it("should set date for INSPIRE specification", async () => {
    const expectedDateInISO = new Date("2009/10/20").toISOString();
    spectator.detectChanges();

    await inspireSpecification.open();

    const options = await inspireSpecification.getOptions();
    expect(options.length).toBe(3);

    await inspireSpecification.clickOptions({ text: "Eins" });

    await passField.clickOptions({ text: "konform" });
    expect(await dateField.getValue()).toBe("20.10.2009");

    const closeDialog = spyOn(mockMatDialogRef, "close");
    spectator.component.submit();

    expect(closeDialog).toHaveBeenCalledWith({
      specification: { key: "1" },
      pass: { key: "1" },
      publicationDate: expectedDateInISO,
      explanation: null,
      isInspire: true,
    });
  });

  function mockCodelists() {
    const codelistQuery = spectator.inject(CodelistQuery, true);
    codelistQuery.getCodelistEntryByKey.withArgs("6005", "1").and.returnValue(<
      CodelistEntry
    >{
      id: "1",
      fields: { de: "Eins" },
      data: "2009-10-20",
      description: "",
    });
    codelistQuery.getCodelistEntryByKey.withArgs("6006", "1").and.returnValue(<
      CodelistEntry
    >{
      id: "1",
      fields: { de: "Zehn" },
      description: "",
    });
  }
});
