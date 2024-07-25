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
import { createHostFactory, SpectatorHost } from "@ngneat/spectator";
import { AddButtonComponent } from "../../../shared/add-button/add-button.component";
import { FormlyFieldConfig, FormlyForm } from "@ngx-formly/core";
import { IgeFormlyModule } from "../../ige-formly.module";
import { MatIconTestingModule } from "@angular/material/icon/testing";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { of } from "rxjs";
import { SelectOptionUi } from "../../../services/codelist/codelist.service";
import { FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatSelectModule } from "@angular/material/select";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { MatAutocompleteHarness } from "@angular/material/autocomplete/testing";
import {
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { delay } from "rxjs/operators";
import { MatInputHarness } from "@angular/material/input/testing";
import { TestKey } from "@angular/cdk/testing";
import { MatSelectHarness } from "@angular/material/select/testing";
import { getTranslocoModule } from "../../../transloco-testing.module";

describe("RepeatListComponent", () => {
  let spectator: SpectatorHost<FormlyForm>;
  let form: FormGroup;

  const createHost = createHostFactory({
    component: FormlyForm,
    declarations: [AddButtonComponent],
    imports: [
      IgeFormlyModule,
      MatIconTestingModule,
      MatSnackBarModule,
      FormsModule,
      MatAutocompleteModule,
      MatSelectModule,
      ReactiveFormsModule,
      MatIconTestingModule,
      getTranslocoModule(),
    ],
    providers: [
      provideHttpClient(withInterceptorsFromDi()),
      provideHttpClientTesting(),
    ],
  });

  describe("Simple", () => {
    let input: MatInputHarness;
    let fieldConfig: FormlyFieldConfig[];

    beforeEach(async () => {
      fieldConfig = [
        {
          key: "repeatListSimple",
          type: "repeatList",
          defaultValue: [],
          props: {},
        },
      ];
      form = new FormGroup({});
      spectator = createHost(
        `<formly-form [fields]="config" [form]="form" [model]="{}"></formly-form>`,
        {
          hostProps: {
            form: form,
            config: fieldConfig,
          },
        },
      );
      const loader = TestbedHarnessEnvironment.loader(spectator.fixture);
      input = await loader.getHarness(MatInputHarness);
    });

    it("should add a simple value", async () => {
      spectator.detectChanges();

      checkItemCount(0);
      await input.setValue("test-simple");
      await (await input.host()).sendKeys(TestKey.ENTER);

      checkItemCount(1);
      checkItemContent(0, "test-simple");
      expect(form.value.repeatListSimple).toEqual(["test-simple"]);
    });

    it("should remove a simple value", async () => {
      spectator.setHostInput("model", { repeatListSimple: ["item 1"] });
      spectator.detectChanges();

      checkItemCount(1);
      removeItem(0);

      checkItemCount(0);
      expect(form.value.repeatListSimple).toEqual([]);
    });

    it("should show multiple items", async () => {
      spectator.setHostInput("model", {
        repeatListSimple: ["item 1", "item 2", "item 3"],
      });
      spectator.detectChanges();

      checkItemCount(3);
      checkItemContent(0, "item 1");
      checkItemContent(1, "item 2");
      checkItemContent(2, "item 3");

      removeItem(1);
      checkItemCount(2);
      checkItemContent(0, "item 1");
      checkItemContent(1, "item 3");
    });

    it("should show a defined placeholder", async () => {
      const placeholder = "This is a test placeholder";
      fieldConfig[0].props.placeholder = placeholder;
      spectator.detectChanges();

      expect(await input.getPlaceholder()).toBe(placeholder);
    });
  });

  describe("Codelist", () => {
    let auto: MatAutocompleteHarness = null;
    let input: MatInputHarness = null;
    let fieldConfig: FormlyFieldConfig[];

    beforeEach(async () => {
      fieldConfig = [
        {
          key: "repeatListCodelist",
          type: "repeatList",
          defaultValue: [],
          props: {
            options: of(<SelectOptionUi[]>[
              { label: "Eins", value: "1" },
              { label: "Zwei", value: "2" },
              { label: "Drei", value: "3" },
            ]),
            formatter: (item: any) => item.value,
          },
        },
      ];
      form = new FormGroup({});

      spectator = createHost(
        `<formly-form [fields]="config" [form]="form"></formly-form>`,
        {
          hostProps: {
            form: form,
            config: fieldConfig,
          },
        },
      );
      const loader = TestbedHarnessEnvironment.loader(spectator.fixture);
      auto = await loader.getHarness(MatAutocompleteHarness);
      input = await loader.getHarness(MatInputHarness);
    });

    it("should add a codelist value", async () => {
      spectator.detectChanges();
      checkItemCount(0);

      // TODO: test => await input.focus()
      spectator.dispatchFakeEvent("input", "focusin");
      await auto.selectOption({ text: "Eins" });

      checkItemCount(1);
      checkItemContent(0, "Eins");
      expect(form.value.repeatListCodelist).toEqual([{ key: "1" }]);

      checkDisabledOptions([true, false, false]);
    });

    it("should remove an item", async () => {
      spectator.setHostInput("model", { repeatListCodelist: [{ key: "1" }] });
      spectator.detectChanges();

      removeItem(0);

      checkItemCount(0);
      expect(form.value.repeatListCodelist).toEqual([]);
      checkDisabledOptions([false, false, false]);
    });

    it("should show a defined placeholder", async () => {
      const placeholder = "This is a test placeholder";
      fieldConfig[0].props.placeholder = placeholder;
      spectator.detectChanges();

      expect(await input.getPlaceholder()).toBe(placeholder);
    });

    xit("should show already selected values as disabled");
    xit("should reset disabled state when setting a new value", () => {
      // the previously disabled items should not be disabled anymore when we load a new model
      // and the list is going to be updated
    });
  });

  describe("Select", () => {
    let select: MatSelectHarness;
    let fieldConfig: FormlyFieldConfig[];

    beforeEach(async () => {
      fieldConfig = [
        {
          key: "repeatListCodelist",
          type: "repeatList",
          defaultValue: [],
          props: {
            asSelect: true,
            options: of(<SelectOptionUi[]>[
              { label: "Eins", value: "1" },
              { label: "Zwei", value: "2" },
              { label: "Drei", value: "3" },
            ]),
          },
        },
      ];
      form = new FormGroup({});

      spectator = createHost(
        `<formly-form [fields]="config" [form]="form"></formly-form>`,
        {
          hostProps: {
            form: form,
            config: fieldConfig,
          },
        },
      );
      const loader = TestbedHarnessEnvironment.loader(spectator.fixture);
      select = await loader.getHarness(MatSelectHarness);
    });

    it("should add a value", async () => {
      spectator.detectChanges();

      await select.open();
      const options = await select.getOptions();
      expect(options.length).toBe(3);

      await select.clickOptions({ text: "Drei" });
      checkItemCount(1);
      checkItemContent(0, "Drei");
      expect(form.value.repeatListCodelist).toEqual([{ key: "3" }]);
    });

    it("should show a defined placeholder", async () => {
      const placeholder = "This is a test placeholder";
      fieldConfig[0].props.placeholder = placeholder;
      spectator.detectChanges();

      const placeholderElement = document.querySelector(
        ".mat-mdc-select-placeholder",
      );
      expect(placeholderElement).toContainText(placeholder);
    });
  });

  describe("Search", () => {
    let fieldConfig: FormlyFieldConfig[];
    let auto: MatAutocompleteHarness;
    let input: MatInputHarness;

    beforeEach(async () => {
      fieldConfig = [
        {
          key: "repeatListCodelist",
          type: "repeatList",
          defaultValue: [],
          props: {
            restCall: (http: HttpClient, query: string) =>
              of([
                { label: "remote 1", other: "a" },
                { label: "remote 2", other: "b" },
              ]).pipe(delay(200)),
            labelField: "label",
          },
        },
      ];
      form = new FormGroup({});

      spectator = createHost(
        `<formly-form [fields]="config" [form]="form"></formly-form>`,
        {
          hostProps: {
            form: form,
            config: fieldConfig,
          },
        },
      );
      const loader = TestbedHarnessEnvironment.loader(spectator.fixture);
      auto = await loader.getHarness(MatAutocompleteHarness);
      input = await loader.getHarness(MatInputHarness);
    });

    it("should add a value after search", async () => {
      spectator.detectChanges();

      expect(spectator.query("mat-spinner")).not.toExist();
      await auto.enterText("remote");
      expect(spectator.query("mat-spinner")).toExist();

      expect((await auto.getOptions()).length).toBe(2);

      spectator.detectChanges();

      await auto.selectOption({ text: "remote 2" });

      checkItemCount(1);
      checkItemContent(0, "remote 2");
      expect(form.value.repeatListCodelist).toEqual([
        { label: "remote 2", other: "b" },
      ]);
      // checkDisabledOptions([false, false, false]);
    });

    it("should remove a value", async () => {
      spectator.setHostInput("model", {
        repeatListCodelist: [{ label: "remote 2", other: "b" }],
      });
      spectator.detectChanges();

      removeItem(0);

      checkItemCount(0);

      expect(form.value.repeatListCodelist).toEqual([]);
      // checkDisabledOptions([false, false, false]);
    });

    it("should show a defined placeholder", async () => {
      const placeholder = "This is a test placeholder";
      fieldConfig[0].props.placeholder = placeholder;
      spectator.detectChanges();

      expect(await input.getPlaceholder()).toBe(placeholder);
    });
  });

  describe("Chips", () => {
    let fieldConfig: FormlyFieldConfig[];
    let auto: MatAutocompleteHarness = null;

    beforeEach(async () => {
      fieldConfig = [
        {
          key: "repeatListCodelist",
          type: "repeatList",
          defaultValue: [],
          props: {
            view: "chip",
            options: of(<SelectOptionUi[]>[
              { label: "Eins", value: "1" },
              { label: "Zwei", value: "2" },
              { label: "Drei", value: "3" },
            ]),
          },
        },
      ];

      spectator = createHost(
        `<formly-form [fields]="config" [form]="form"></formly-form>`,
        {
          hostProps: {
            form: form,
            config: fieldConfig,
          },
        },
      );
      const loader = TestbedHarnessEnvironment.loader(spectator.fixture);
      auto = await loader.getHarness(MatAutocompleteHarness);
    });

    it("should show an added value", async () => {
      spectator.detectChanges();
      checkItemCount(0);

      spectator.dispatchFakeEvent("input", "focusin");
      await auto.selectOption({ text: "Eins" });

      checkItemCount(1);
      checkItemContent(0, "Eins");
    });

    it("should remove a chip", async () => {
      spectator.setHostInput("model", { repeatListCodelist: [{ key: "1" }] });
      spectator.detectChanges();

      removeChip(0);
      checkItemCount(0);
    });
  });

  function checkDisabledOptions(values: boolean[]) {
    spectator.dispatchFakeEvent("input", "focusin");
    let matOptions = document.querySelectorAll("mat-option");
    values.forEach((value, index) => {
      expect(matOptions[index]).toHaveAttribute("aria-disabled", `${value}`);
    });
  }

  function checkItemCount(count: number) {
    let listItemSelector = "[data-cy=list-item]";
    let elements = spectator.queryAll(listItemSelector);
    expect(elements.length).toBe(count);
  }

  function checkItemContent(index: number, text: string) {
    let listItemSelector = "[data-cy=list-item]";
    let elements = spectator.queryAll(listItemSelector);
    expect(elements[index]).toContainText(text);
  }

  function removeChip(index: number) {
    // since a chip contains of two buttons, we need to use the latter one
    removeItem(index * 2 + 1);
  }

  function removeItem(index: number) {
    const removeButton = spectator.queryAll("[data-cy=list-item] button")[
      index
    ] as HTMLElement;

    removeButton.click();
    spectator.detectChanges();
  }
});
