import { RepeatListComponent } from "./repeat-list.component";
import { createHostFactory, SpectatorHost } from "@ngneat/spectator";
import { AddButtonComponent } from "../../../shared/add-button/add-button.component";
import { FormlyFieldConfig, FormlyForm } from "@ngx-formly/core";
import { RepeatDetailListComponent } from "../repeat-detail-list/repeat-detail-list.component";
import { IgeFormlyModule } from "../../ige-formly.module";
import { MatIconTestingModule } from "@angular/material/icon/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { of } from "rxjs";
import { Codelist } from "../../../store/codelist/codelist.model";
import { SelectOptionUi } from "../../../services/codelist/codelist.service";
import { FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatSelectModule } from "@angular/material/select";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { MatAutocompleteHarness } from "@angular/material/autocomplete/testing";
import { HttpClient } from "@angular/common/http";
import { delay } from "rxjs/operators";

describe("RepeatListComponent", () => {
  let spectator: SpectatorHost<FormlyForm>;
  const form = new FormGroup<any>({});
  let auto: MatAutocompleteHarness = null;

  const createHost = createHostFactory({
    component: FormlyForm,
    declarations: [RepeatDetailListComponent, AddButtonComponent],
    imports: [
      IgeFormlyModule,
      MatIconTestingModule,
      HttpClientTestingModule,
      MatSnackBarModule,
      FormsModule,
      MatAutocompleteModule,
      MatSelectModule,
      ReactiveFormsModule,
      MatIconTestingModule,
    ],
  });

  describe("Simple", () => {
    beforeEach(() => {
      spectator = createHost(`<formly-form [fields]="config"></formly-form>`, {
        hostProps: {
          config: [
            {
              key: "repeatListSimple",
              type: "repeatList",
              defaultValue: [],
              props: {},
            },
          ] as FormlyFieldConfig[],
        },
      });
    });

    it("should create", () => {
      expect(spectator).toBeTruthy();
    });

    it("should add a simple value", () => {
      spectator.detectChanges();
      let input = "input";

      checkItemCount(0);
      spectator.typeInElement("test-simple", input);
      spectator.dispatchKeyboardEvent(input, "keydown", "Enter");
      checkItemCount(1);
    });
  });

  describe("Codelist", () => {
    beforeEach(async () => {
      spectator = createHost(
        `<formly-form [fields]="config" [form]="form"></formly-form>`,
        {
          hostProps: {
            form: form,
            config: [
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
            ] as FormlyFieldConfig[],
          },
        }
      );
      const loader = TestbedHarnessEnvironment.loader(spectator.fixture);
      auto = await loader.getHarness(MatAutocompleteHarness);
    });

    it("should add a codelist value", async () => {
      spectator.detectChanges();
      checkItemCount(0);

      spectator.dispatchFakeEvent("input", "focusin");
      await auto.selectOption({ text: "Eins" });

      checkItemCount(1);
      checkItemContent(0, "Eins");
      expect(form.value.repeatListCodelist).toEqual([{ key: "1" }]);

      checkDisabledOptions([true, false, false]);
    });

    it("should remove an item", async () => {
      spectator.detectChanges();
      spectator.dispatchFakeEvent("input", "focusin");

      await auto.selectOption({ text: "Eins" });

      removeItem(0);
      spectator.detectChanges();

      checkItemCount(0);
      expect(form.value.repeatListCodelist).toEqual([]);
      checkDisabledOptions([false, false, false]);
    });
  });

  describe("Select", () => {
    beforeEach(async () => {
      spectator = createHost(
        `<formly-form [fields]="config" [form]="form"></formly-form>`,
        {
          hostProps: {
            form: form,
            config: [
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
                  codelistId: 123,
                  formatter: (item: any, form: any, row: any) => item.value,
                },
              },
            ] as FormlyFieldConfig[],
          },
        }
      );
      const loader = TestbedHarnessEnvironment.loader(spectator.fixture);
      auto = await loader.getHarness(MatAutocompleteHarness);
    });

    xit("should add a value", async () => {});
  });

  describe("Search", () => {
    beforeEach(async () => {
      spectator = createHost(
        `<formly-form [fields]="config" [form]="form"></formly-form>`,
        {
          hostProps: {
            form: form,
            config: [
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
            ] as FormlyFieldConfig[],
          },
        }
      );
      const loader = TestbedHarnessEnvironment.loader(spectator.fixture);
      auto = await loader.getHarness(MatAutocompleteHarness);
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
      spectator.detectChanges();

      await auto.enterText("remote");
      spectator.detectChanges();
      await auto.selectOption({ text: "remote 2" });
      removeItem(0);

      spectator.detectChanges();
      checkItemCount(0);

      expect(form.value.repeatListCodelist).toEqual([]);
      // checkDisabledOptions([false, false, false]);
    });
  });

  describe("Chips", () => {
    beforeEach(async () => {
      spectator = createHost(
        `<formly-form [fields]="config" [form]="form"></formly-form>`,
        {
          hostProps: {
            form: form,
            config: [
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
            ] as FormlyFieldConfig[],
          },
        }
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

  function removeItem(index: number) {
    const removeButton = spectator.queryAll("[data-cy=list-item] button")[
      index
    ] as HTMLElement;

    removeButton.click();
  }
});
