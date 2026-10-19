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
import {
  createHostFactory,
  mockProvider,
  SpectatorHost,
} from "@ngneat/spectator/vitest";

import {
  FormlyFieldConfig,
  FormlyForm,
  provideFormlyCore,
} from "@ngx-formly/core";
import { withFormlyMaterial } from "@ngx-formly/material";
import { withFormlyFieldDatepicker } from "@ngx-formly/material/datepicker";
import { withFormlyFieldToggle } from "@ngx-formly/material/toggle";
import {
  importProvidersFrom,
  provideZonelessChangeDetection,
} from "@angular/core";
import { MatNativeDateModule } from "@angular/material/core";
import { OneColumnWrapperComponent } from "./wrapper/one-column-wrapper.component";
import { InlineHelpWrapperComponent } from "./wrapper/inline-help-wrapper/inline-help-wrapper.component";
import { ConfigService } from "../services/config/config.service";
import { ContextHelpService } from "../services/context-help/context-help.service";
import { FormStateService } from "../+form/form-state.service";
import { dataCyExtension, dataCyValue } from "./data-cy.extension";

describe("Formly data-cy hooks", () => {
  let spectator: SpectatorHost<FormlyForm>;
  const createHost = createHostFactory({
    component: FormlyForm,
    imports: [OneColumnWrapperComponent, InlineHelpWrapperComponent],
    providers: [
      provideZonelessChangeDetection(),
      provideFormlyCore([
        {
          wrappers: [
            { name: "panel", component: OneColumnWrapperComponent },
            { name: "inline-help", component: InlineHelpWrapperComponent },
          ],
          extensions: [{ name: "data-cy", extension: dataCyExtension }],
        },
        ...withFormlyMaterial(),
        withFormlyFieldToggle(),
        withFormlyFieldDatepicker(),
      ]),
      importProvidersFrom(MatNativeDateModule),
      mockProvider(ConfigService, {
        $userInfo: { getValue: () => ({ currentCatalog: { type: "ingrid" } }) },
      }),
      mockProvider(ContextHelpService),
      mockProvider(FormStateService),
    ],
  });

  function render(fields: FormlyFieldConfig[]) {
    spectator = createHost(`<formly-form [fields]="config"></formly-form>`, {
      hostProps: { config: fields },
    });
  }

  it("derives the hook value with the one-column fallback chain", () => {
    expect(
      dataCyValue(<FormlyFieldConfig>{
        key: "title",
        props: { contextHelpId: "cd_title" },
      }),
    ).toBe("cd_title");
    expect(dataCyValue(<FormlyFieldConfig>{ key: "title", props: {} })).toBe(
      "title",
    );
    expect(
      dataCyValue(<FormlyFieldConfig>{
        key: null,
        props: { externalLabel: "Erscheinung" },
      }),
    ).toBe("Erscheinung");
    expect(dataCyValue(<FormlyFieldConfig>{ props: {} })).toBeNull();
    expect(
      dataCyValue(<FormlyFieldConfig>{ key: ["group", "volume"], props: {} }),
    ).toBe("volume");
  });

  it("keeps an existing data-cy hook (pilot: quote sub-fields via addInputInline)", () => {
    render([
      {
        key: "volume",
        type: "input",
        wrappers: ["inline-help", "form-field"],
        props: {
          externalLabel: "Band/Heft",
          hasInlineContextHelp: true,
          appearance: "outline",
          attributes: { "data-cy": "input-volume" },
        },
      },
    ]);
    expect(spectator.query('input[data-cy="input-volume"]')).toBeTruthy();
  });

  it("adds a hook to a raw input field", () => {
    render([
      {
        key: "title",
        type: "input",
        wrappers: ["form-field"],
        props: { label: "Titel", appearance: "outline" },
      },
    ]);
    expect(spectator.query('input[data-cy="input-title"]')).toBeTruthy();
  });

  it("adds a hook to extended input types (number)", () => {
    render([
      {
        key: "amount",
        type: "number",
        wrappers: ["form-field"],
        props: { label: "Anzahl", appearance: "outline" },
      },
    ]);
    expect(spectator.query('input[data-cy="input-amount"]')).toBeTruthy();
  });

  it("adds a hook to a textarea field", () => {
    render([
      {
        key: "notes",
        type: "textarea",
        wrappers: ["form-field"],
        props: { label: "Anmerkungen", appearance: "outline" },
      },
    ]);
    expect(spectator.query('textarea[data-cy="textarea-notes"]')).toBeTruthy();
  });

  it("adds a hook to a datepicker field", () => {
    render([
      {
        key: "validUntil",
        type: "datepicker",
        wrappers: ["form-field"],
        props: { label: "Ende der Gültigkeit", appearance: "outline" },
      },
    ]);
    expect(
      spectator.query('input[data-cy="datepicker-validUntil"]'),
    ).toBeTruthy();
  });

  it("adds a hook to a checkbox field", () => {
    render([
      {
        key: "active",
        type: "checkbox",
        wrappers: [],
        props: { label: "Aktiv" },
      },
    ]);
    expect(
      spectator.query('mat-checkbox[data-cy="checkbox-active"]'),
    ).toBeTruthy();
  });

  it("adds a hook to a toggle field", () => {
    render([
      {
        key: "openData",
        type: "toggle",
        wrappers: [],
        props: { label: "Open Data" },
      },
    ]);
    expect(
      spectator.query('mat-slide-toggle[data-cy="toggle-openData"]'),
    ).toBeTruthy();
  });

  it("adds a hook to a radio field", () => {
    render([
      {
        key: "choice",
        type: "radio",
        wrappers: ["form-field"],
        props: {
          label: "Auswahl",
          appearance: "outline",
          labelProp: "value",
          valueProp: "id",
          options: [{ id: "a", value: "Option A" }],
        },
      },
    ]);
    expect(
      spectator.query('mat-radio-group[data-cy="radio-choice"]'),
    ).toBeTruthy();
  });

  it("prefers contextHelpId over the field key", () => {
    render([
      {
        key: "title",
        type: "input",
        wrappers: ["form-field"],
        props: {
          label: "Titel",
          appearance: "outline",
          contextHelpId: "cd_title",
        },
      },
    ]);
    expect(spectator.query('input[data-cy="input-cd_title"]')).toBeTruthy();
  });

  it("does not add a hook without key, contextHelpId or externalLabel", () => {
    render([
      {
        type: "input",
        wrappers: ["form-field"],
        props: { label: "Titel", appearance: "outline" },
      },
    ]);
    expect(spectator.query("input[data-cy]")).toBeFalsy();
  });

  it("does not duplicate the panel wrapper hook", () => {
    render([
      {
        key: "location",
        type: "textarea",
        wrappers: ["panel", "form-field"],
        props: { externalLabel: "Standort", appearance: "outline" },
      },
    ]);
    // container hook of the one-column wrapper stays as-is
    expect(spectator.query('div[data-cy="location"]')).toBeTruthy();
    // the field-level hook is type-prefixed, so both selectors stay unique
    expect(
      spectator.query('textarea[data-cy="textarea-location"]'),
    ).toBeTruthy();
    expect(spectator.queryAll('[data-cy="location"]').length).toBe(1);
  });
});
