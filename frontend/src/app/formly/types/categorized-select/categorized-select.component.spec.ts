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
import { createHostFactory, SpectatorHost } from "@ngneat/spectator/vitest";
import { FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  FormlyFieldConfig,
  FormlyForm,
  provideFormlyCore,
} from "@ngx-formly/core";
import { withFormlyMaterial } from "@ngx-formly/material";
import { MatIconTestingModule } from "@angular/material/icon/testing";
import { provideZonelessChangeDetection } from "@angular/core";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { MatSelectHarness } from "@angular/material/select/testing";
import { getTranslocoModule } from "../../../transloco-testing.module";
import { CategorizedSelectComponent } from "./categorized-select.component";
import {
  SelectCategory,
  SelectOption,
} from "../../../services/codelist/codelist.service";
import { MatTooltipModule } from "@angular/material/tooltip";
import { AngularSplitModule } from "angular-split";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatChipsModule } from "@angular/material/chips";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatListModule } from "@angular/material/list";

describe("CategorizedSelectComponent", () => {
  let spectator: SpectatorHost<FormlyForm>;
  let form: FormGroup;

  const mockCategories: SelectCategory[] = [
    {
      title: "Category 1",
      subtitle: "Subtitle 1",
      options: [
        new SelectOption("opt1", "Option 1"),
        new SelectOption("opt2", "Option 2"),
      ],
    },
    {
      title: "Category 2",
      options: [new SelectOption("opt3", "Option 3")],
    },
  ];

  const createHost = createHostFactory({
    component: FormlyForm,
    imports: [
      ReactiveFormsModule,
      FormsModule,
      MatFormFieldModule,
      MatSelectModule,
      MatChipsModule,
      MatCheckboxModule,
      MatListModule,
      MatTooltipModule,
      MatIconTestingModule,
      AngularSplitModule,
      getTranslocoModule(),
    ],
    providers: [
      provideZonelessChangeDetection(),
      provideHttpClient(withInterceptorsFromDi()),
      provideHttpClientTesting(),
      provideFormlyCore([
        {
          types: [
            {
              name: "categorized-select",
              component: CategorizedSelectComponent,
            },
          ],
        },
        ...withFormlyMaterial(),
      ]),
    ],
  });

  beforeEach(() => {
    form = new FormGroup({});
    const fieldConfig: FormlyFieldConfig[] = [
      {
        key: "categorized",
        type: "categorized-select",
        defaultValue: [],
        props: {
          codelistId: "test-codelist",
          categories: mockCategories,
          showHeader: true,
        },
      },
    ];

    spectator = createHost(
      `<formly-form [fields]="config" [form]="form" [model]="model"></formly-form>`,
      {
        hostProps: {
          form: form,
          config: fieldConfig,
          model: {},
        },
      },
    );
  });

  it("should create", () => {
    expect(spectator.component).toBeTruthy();
  });

  it("should render as-split with as-split-area when categories exist and select is opened", async () => {
    const loader = TestbedHarnessEnvironment.loader(spectator.fixture);
    const select = await loader.getHarness(MatSelectHarness);
    await select.open();

    const splitElement = document.querySelector("as-split");
    expect(splitElement).toBeTruthy();
    expect(splitElement?.classList.contains("list-wrapper")).toBe(true);

    const splitAreas = document.querySelectorAll("as-split-area");
    expect(splitAreas.length).toBe(2);
    expect(splitAreas[0].classList.contains("category-list")).toBe(true);
    expect(splitAreas[1].classList.contains("option-list")).toBe(true);
  });

  it("should render category buttons in the first split area when select is opened", async () => {
    const loader = TestbedHarnessEnvironment.loader(spectator.fixture);
    const select = await loader.getHarness(MatSelectHarness);
    await select.open();

    const categoryButtons = document.querySelectorAll(
      "as-split-area.category-list button",
    );
    expect(categoryButtons.length).toBe(2);
    expect(categoryButtons[0].textContent).toContain("Category 1");
    expect(categoryButtons[1].textContent).toContain("Category 2");
  });

  it("should render checkboxes with tooltips and line clamping for options", async () => {
    const loader = TestbedHarnessEnvironment.loader(spectator.fixture);
    const select = await loader.getHarness(MatSelectHarness);
    await select.open();

    const categoryButtons = document.querySelectorAll(
      "as-split-area.category-list button",
    ) as NodeListOf<HTMLButtonElement>;
    categoryButtons[0].click();
    spectator.fixture.detectChanges();

    const checkboxes = document.querySelectorAll(
      "as-split-area.option-list mat-checkbox",
    );
    expect(checkboxes.length).toBe(2);

    const messageId = checkboxes[0].getAttribute("aria-describedby");
    if (messageId) {
      expect(document.getElementById(messageId)?.textContent).toContain(
        "Option 1",
      );
    }

    const lineClamp = checkboxes[0].querySelector(".line-clamp-1");
    expect(lineClamp).toBeTruthy();
    expect(lineClamp?.textContent?.trim()).toBe("Option 1");
  });
});
